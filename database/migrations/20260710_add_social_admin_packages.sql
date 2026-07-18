-- Business mutations are kept in Oracle PL/SQL. Express validates requests and
-- invokes these package entry points; it does not duplicate authorization rules.

CREATE OR REPLACE PACKAGE PKG_PROFILE AS
  PROCEDURE get_public_profile(
    p_slug IN VARCHAR2,
    p_profile OUT SYS_REFCURSOR,
    p_papers OUT SYS_REFCURSOR,
    p_questions OUT SYS_REFCURSOR
  );
  PROCEDURE ensure_profile(p_user_id IN NUMBER, p_slug IN VARCHAR2);
  PROCEDURE update_profile(
    p_user_id IN NUMBER,
    p_headline IN VARCHAR2,
    p_department IN VARCHAR2,
    p_position_title IN VARCHAR2,
    p_website_url IN VARCHAR2,
    p_orcid IN VARCHAR2,
    p_visibility IN VARCHAR2
  );
  PROCEDURE follow_user(p_follower_user_id IN NUMBER, p_followed_user_id IN NUMBER);
  PROCEDURE unfollow_user(p_follower_user_id IN NUMBER, p_followed_user_id IN NUMBER);
END PKG_PROFILE;
/

CREATE OR REPLACE PACKAGE BODY PKG_PROFILE AS
  PROCEDURE get_public_profile(
    p_slug IN VARCHAR2,
    p_profile OUT SYS_REFCURSOR,
    p_papers OUT SYS_REFCURSOR,
    p_questions OUT SYS_REFCURSOR
  ) AS
  BEGIN
    OPEN p_profile FOR
      SELECT u.user_id, u.username, u.full_name, u.affiliation, u.country, u.profile_picture_url, u.bio,
             rp.slug, rp.headline, rp.department, rp.position_title, rp.website_url, rp.orcid,
             NVL(rs.followers, 0) followers, NVL(rs.following, 0) following, NVL(rs.total_reads, 0) total_reads,
             NVL(rs.rg_score, 0) rg_score
      FROM RESEARCHER_PROFILES rp
      JOIN USERS u ON u.user_id = rp.user_id
      LEFT JOIN RESEARCHER_STATS rs ON rs.user_id = u.user_id
      WHERE rp.slug = LOWER(TRIM(p_slug)) AND rp.visibility = 'public' AND u.is_active = 1;

    OPEN p_papers FOR
      SELECT DISTINCT p.paper_id, p.title, p.abstract, p.publication_date, p.citation_count, p.view_count,
             p.download_count, j.name journal_name
      FROM RESEARCHER_PROFILES rp
      JOIN USER_AUTHOR_CLAIMS claim ON claim.user_id = rp.user_id AND claim.status = 'verified'
      JOIN PAPER_AUTHORS pa ON pa.author_id = claim.author_id
      JOIN RESEARCH_PAPERS p ON p.paper_id = pa.paper_id
      LEFT JOIN JOURNALS j ON j.journal_id = p.journal_id
      WHERE rp.slug = LOWER(TRIM(p_slug)) AND p.status = 'published' AND p.visibility = 'public'
      ORDER BY p.publication_date DESC, p.paper_id DESC;

    OPEN p_questions FOR
      SELECT q.question_id, q.title, q.body, q.category, q.view_count, q.answer_count, q.created_at
      FROM RESEARCHER_PROFILES rp
      JOIN QUESTIONS q ON q.user_id = rp.user_id
      WHERE rp.slug = LOWER(TRIM(p_slug)) AND q.status = 'published' AND q.visibility = 'public'
      ORDER BY q.created_at DESC;
  END get_public_profile;

  PROCEDURE ensure_profile(p_user_id IN NUMBER, p_slug IN VARCHAR2) AS
    l_user_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO l_user_count FROM USERS WHERE user_id = p_user_id AND is_active = 1;
    IF l_user_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20001, 'Active user not found');
    END IF;

    MERGE INTO RESEARCHER_PROFILES target
    USING (SELECT p_user_id user_id, LOWER(TRIM(p_slug)) slug FROM dual) source
    ON (target.user_id = source.user_id)
    WHEN MATCHED THEN UPDATE SET target.slug = source.slug, target.updated_at = SYSTIMESTAMP
    WHEN NOT MATCHED THEN INSERT (user_id, slug) VALUES (source.user_id, source.slug);
  END ensure_profile;

  PROCEDURE update_profile(
    p_user_id IN NUMBER,
    p_headline IN VARCHAR2,
    p_department IN VARCHAR2,
    p_position_title IN VARCHAR2,
    p_website_url IN VARCHAR2,
    p_orcid IN VARCHAR2,
    p_visibility IN VARCHAR2
  ) AS
  BEGIN
    IF p_visibility NOT IN ('public', 'network', 'private') THEN
      RAISE_APPLICATION_ERROR(-20002, 'Invalid profile visibility');
    END IF;

    UPDATE RESEARCHER_PROFILES
    SET headline = p_headline,
        department = p_department,
        position_title = p_position_title,
        website_url = p_website_url,
        orcid = p_orcid,
        visibility = p_visibility,
        profile_completed_at = SYSTIMESTAMP,
        updated_at = SYSTIMESTAMP
    WHERE user_id = p_user_id;

    IF SQL%ROWCOUNT = 0 THEN
      RAISE_APPLICATION_ERROR(-20003, 'Researcher profile not found');
    END IF;
  END update_profile;

  PROCEDURE follow_user(p_follower_user_id IN NUMBER, p_followed_user_id IN NUMBER) AS
  BEGIN
    IF p_follower_user_id = p_followed_user_id THEN
      RAISE_APPLICATION_ERROR(-20004, 'A user cannot follow themselves');
    END IF;

    INSERT INTO USER_FOLLOWS (follower_user_id, followed_user_id)
    VALUES (p_follower_user_id, p_followed_user_id);
  EXCEPTION WHEN DUP_VAL_ON_INDEX THEN
    RAISE_APPLICATION_ERROR(-20005, 'Already following this researcher');
  END follow_user;

  PROCEDURE unfollow_user(p_follower_user_id IN NUMBER, p_followed_user_id IN NUMBER) AS
  BEGIN
    DELETE FROM USER_FOLLOWS
    WHERE follower_user_id = p_follower_user_id AND followed_user_id = p_followed_user_id;

    IF SQL%ROWCOUNT = 0 THEN
      RAISE_APPLICATION_ERROR(-20006, 'Not following this researcher');
    END IF;
  END unfollow_user;
END PKG_PROFILE;
/

CREATE OR REPLACE PACKAGE PKG_MODERATION AS
  PROCEDURE submit_report(
    p_reporter_user_id IN NUMBER,
    p_target_type IN VARCHAR2,
    p_target_id IN NUMBER,
    p_reason_code IN VARCHAR2,
    p_details IN CLOB,
    p_report_id OUT NUMBER,
    p_case_id OUT NUMBER
  );
  PROCEDURE apply_action(
    p_case_id IN NUMBER,
    p_actor_admin_user_id IN NUMBER,
    p_action_type IN VARCHAR2,
    p_notes IN VARCHAR2
  );
END PKG_MODERATION;
/

CREATE OR REPLACE PACKAGE BODY PKG_MODERATION AS
  PROCEDURE submit_report(
    p_reporter_user_id IN NUMBER,
    p_target_type IN VARCHAR2,
    p_target_id IN NUMBER,
    p_reason_code IN VARCHAR2,
    p_details IN CLOB,
    p_report_id OUT NUMBER,
    p_case_id OUT NUMBER
  ) AS
  BEGIN
    IF p_target_type NOT IN ('user', 'paper', 'review', 'question', 'answer') THEN
      RAISE_APPLICATION_ERROR(-20101, 'Unsupported moderation target');
    END IF;

    INSERT INTO CONTENT_REPORTS (reporter_user_id, target_type, target_id, reason_code, details)
    VALUES (p_reporter_user_id, p_target_type, p_target_id, p_reason_code, p_details)
    RETURNING report_id INTO p_report_id;

    INSERT INTO MODERATION_CASES (report_id, target_type, target_id)
    VALUES (p_report_id, p_target_type, p_target_id)
    RETURNING case_id INTO p_case_id;
  END submit_report;

  PROCEDURE apply_action(
    p_case_id IN NUMBER,
    p_actor_admin_user_id IN NUMBER,
    p_action_type IN VARCHAR2,
    p_notes IN VARCHAR2
  ) AS
    l_target_type MODERATION_CASES.target_type%TYPE;
    l_target_id MODERATION_CASES.target_id%TYPE;
    l_table_name VARCHAR2(30);
    l_new_status VARCHAR2(20);
    l_before_state CLOB;
    l_after_state CLOB;
    l_authorized NUMBER;
  BEGIN
    SELECT COUNT(*) INTO l_authorized FROM USERS
    WHERE user_id = p_actor_admin_user_id AND role IN ('admin', 'moderator') AND is_active = 1;
    IF l_authorized = 0 THEN
      RAISE_APPLICATION_ERROR(-20102, 'Administrator permission required');
    END IF;

    SELECT target_type, target_id INTO l_target_type, l_target_id
    FROM MODERATION_CASES WHERE case_id = p_case_id FOR UPDATE;

    IF p_action_type NOT IN ('hide', 'restore', 'warn', 'suspend', 'ban', 'edit_metadata', 'delete') THEN
      RAISE_APPLICATION_ERROR(-20103, 'Unsupported moderation action');
    END IF;

    IF l_target_type = 'user' THEN
      SELECT '{"is_active":' || is_active || '}' INTO l_before_state FROM USERS WHERE user_id = l_target_id;
      IF p_action_type IN ('suspend', 'ban') THEN
        UPDATE USERS SET is_active = 0, updated_at = SYSTIMESTAMP WHERE user_id = l_target_id;
      ELSIF p_action_type = 'restore' THEN
        UPDATE USERS SET is_active = 1, updated_at = SYSTIMESTAMP WHERE user_id = l_target_id;
      END IF;
      SELECT '{"is_active":' || is_active || '}' INTO l_after_state FROM USERS WHERE user_id = l_target_id;
    ELSIF l_target_type IN ('paper', 'review', 'question', 'answer') THEN
      l_table_name := CASE l_target_type
        WHEN 'paper' THEN 'RESEARCH_PAPERS'
        WHEN 'review' THEN 'REVIEWS'
        WHEN 'question' THEN 'QUESTIONS'
        WHEN 'answer' THEN 'ANSWERS'
      END;
      EXECUTE IMMEDIATE 'SELECT ''{"status":"'' || status || ''"}'' FROM ' || l_table_name || ' WHERE ' || l_target_type || '_id = :id'
        INTO l_before_state USING l_target_id;

      l_new_status := CASE p_action_type
        WHEN 'hide' THEN 'hidden'
        WHEN 'restore' THEN 'published'
        WHEN 'delete' THEN 'removed'
        ELSE NULL
      END;
      IF l_new_status IS NOT NULL THEN
        EXECUTE IMMEDIATE
          'UPDATE ' || l_table_name ||
          ' SET status = :status, deleted_at = CASE WHEN :status = ''removed'' THEN SYSTIMESTAMP ELSE deleted_at END,' ||
          ' deleted_by_user_id = CASE WHEN :status = ''removed'' THEN :actor ELSE deleted_by_user_id END,' ||
          ' updated_at = SYSTIMESTAMP WHERE ' || l_target_type || '_id = :id'
          USING l_new_status, l_new_status, p_actor_admin_user_id, l_target_id;
      END IF;
      EXECUTE IMMEDIATE 'SELECT ''{"status":"'' || status || ''"}'' FROM ' || l_table_name || ' WHERE ' || l_target_type || '_id = :id'
        INTO l_after_state USING l_target_id;
    END IF;

    INSERT INTO MODERATION_ACTIONS (case_id, actor_admin_user_id, action_type, before_state, after_state, notes)
    VALUES (p_case_id, p_actor_admin_user_id, p_action_type, l_before_state, l_after_state, p_notes);

    UPDATE MODERATION_CASES
    SET status = CASE WHEN p_action_type IN ('hide', 'restore', 'suspend', 'ban', 'delete') THEN 'resolved' ELSE 'investigating' END,
        resolution = p_notes,
        updated_at = SYSTIMESTAMP
    WHERE case_id = p_case_id;
  END apply_action;
END PKG_MODERATION;
/

CREATE OR REPLACE PACKAGE PKG_ADMIN AS
  PROCEDURE assign_role(p_user_id IN NUMBER, p_role_key IN VARCHAR2, p_actor_admin_user_id IN NUMBER);
  PROCEDURE set_user_active(p_user_id IN NUMBER, p_is_active IN NUMBER, p_actor_admin_user_id IN NUMBER);
  PROCEDURE retry_email(p_email_id IN NUMBER, p_actor_admin_user_id IN NUMBER);
  PROCEDURE refresh_researcher_stats(p_user_id IN NUMBER);
  PROCEDURE get_moderation_cases(p_limit IN NUMBER, p_offset IN NUMBER, p_cases OUT SYS_REFCURSOR);
  PROCEDURE get_audit_logs(p_limit IN NUMBER, p_offset IN NUMBER, p_logs OUT SYS_REFCURSOR);
  PROCEDURE get_email_queue(p_limit IN NUMBER, p_offset IN NUMBER, p_items OUT SYS_REFCURSOR);
END PKG_ADMIN;
/

CREATE OR REPLACE PACKAGE BODY PKG_ADMIN AS
  PROCEDURE require_admin(p_actor_admin_user_id IN NUMBER) AS
    l_authorized NUMBER;
  BEGIN
    SELECT COUNT(*) INTO l_authorized FROM USERS
    WHERE user_id = p_actor_admin_user_id AND role = 'admin' AND is_active = 1;
    IF l_authorized = 0 THEN
      RAISE_APPLICATION_ERROR(-20201, 'Administrator permission required');
    END IF;
  END require_admin;

  PROCEDURE assign_role(p_user_id IN NUMBER, p_role_key IN VARCHAR2, p_actor_admin_user_id IN NUMBER) AS
    l_role_id NUMBER;
  BEGIN
    require_admin(p_actor_admin_user_id);
    SELECT role_id INTO l_role_id FROM ROLE_DEFINITIONS WHERE role_key = p_role_key;
    MERGE INTO USER_ROLE_ASSIGNMENTS target
    USING (SELECT p_user_id user_id, l_role_id role_id FROM dual) source
    ON (target.user_id = source.user_id AND target.role_id = source.role_id)
    WHEN NOT MATCHED THEN INSERT (user_id, role_id, assigned_by_user_id)
      VALUES (source.user_id, source.role_id, p_actor_admin_user_id);
  END assign_role;

  PROCEDURE set_user_active(p_user_id IN NUMBER, p_is_active IN NUMBER, p_actor_admin_user_id IN NUMBER) AS
  BEGIN
    require_admin(p_actor_admin_user_id);
    IF p_is_active NOT IN (0, 1) THEN
      RAISE_APPLICATION_ERROR(-20202, 'is_active must be 0 or 1');
    END IF;
    UPDATE USERS SET is_active = p_is_active, updated_at = SYSTIMESTAMP WHERE user_id = p_user_id;
    IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20203, 'User not found'); END IF;
    INSERT INTO AUDIT_LOGS (user_id, table_name, action, record_id, new_values)
    VALUES (p_actor_admin_user_id, 'USERS', 'UPDATE', p_user_id, '{"is_active":' || p_is_active || '}');
  END set_user_active;

  PROCEDURE retry_email(p_email_id IN NUMBER, p_actor_admin_user_id IN NUMBER) AS
  BEGIN
    require_admin(p_actor_admin_user_id);
    UPDATE EMAIL_QUEUE
    SET status = 'pending', error_message = NULL, sent_at = NULL
    WHERE email_id = p_email_id;
    IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20204, 'Email queue item not found'); END IF;
    INSERT INTO AUDIT_LOGS (user_id, table_name, action, record_id, new_values)
    VALUES (p_actor_admin_user_id, 'EMAIL_QUEUE', 'UPDATE', p_email_id, '{"status":"pending"}');
  END retry_email;

  PROCEDURE refresh_researcher_stats(p_user_id IN NUMBER) AS
    l_saved NUMBER;
    l_following NUMBER;
    l_followers NUMBER;
    l_reviews NUMBER;
    l_questions NUMBER;
    l_answers NUMBER;
    l_requests NUMBER;
    l_reads NUMBER;
  BEGIN
    SELECT COUNT(*) INTO l_saved FROM SAVED_PAPERS WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO l_following FROM USER_FOLLOWS WHERE follower_user_id = p_user_id;
    SELECT COUNT(*) INTO l_followers FROM USER_FOLLOWS WHERE followed_user_id = p_user_id;
    SELECT COUNT(*) INTO l_reviews FROM REVIEWS WHERE user_id = p_user_id AND status = 'published';
    SELECT COUNT(*) INTO l_questions FROM QUESTIONS WHERE user_id = p_user_id AND status = 'published';
    SELECT COUNT(*) INTO l_answers FROM ANSWERS WHERE user_id = p_user_id AND status = 'published';
    SELECT COUNT(*) INTO l_requests FROM EMAIL_QUEUE WHERE requester_user_id = p_user_id;
    SELECT COUNT(*) INTO l_reads FROM USER_ACTIVITY WHERE user_id = p_user_id AND activity_type = 'view';

    MERGE INTO RESEARCHER_STATS target
    USING (SELECT p_user_id user_id FROM dual) source ON (target.user_id = source.user_id)
    WHEN MATCHED THEN UPDATE SET
      saved_papers = l_saved, following = l_following, followers = l_followers, reviews = l_reviews,
      questions = l_questions, answers = l_answers, full_text_requests = l_requests, total_reads = l_reads,
      rg_score = l_saved + l_following + l_followers + l_reviews + l_questions + l_answers,
      updated_at = SYSTIMESTAMP
    WHEN NOT MATCHED THEN INSERT (
      user_id, saved_papers, following, followers, reviews, questions, answers, full_text_requests, total_reads, rg_score
    ) VALUES (
      p_user_id, l_saved, l_following, l_followers, l_reviews, l_questions, l_answers, l_requests, l_reads,
      l_saved + l_following + l_followers + l_reviews + l_questions + l_answers
    );
  END refresh_researcher_stats;

  PROCEDURE get_moderation_cases(p_limit IN NUMBER, p_offset IN NUMBER, p_cases OUT SYS_REFCURSOR) AS
  BEGIN
    OPEN p_cases FOR
      SELECT mc.case_id, mc.report_id, mc.target_type, mc.target_id, mc.status, mc.priority,
             mc.assigned_admin_user_id, assignee.username assigned_admin_username, mc.resolution,
             mc.created_at, mc.updated_at, cr.reason_code, cr.details, reporter.username reporter_username
      FROM MODERATION_CASES mc
      LEFT JOIN CONTENT_REPORTS cr ON cr.report_id = mc.report_id
      LEFT JOIN USERS assignee ON assignee.user_id = mc.assigned_admin_user_id
      LEFT JOIN USERS reporter ON reporter.user_id = cr.reporter_user_id
      ORDER BY CASE mc.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
               mc.created_at DESC
      OFFSET p_offset ROWS FETCH NEXT p_limit ROWS ONLY;
  END get_moderation_cases;

  PROCEDURE get_audit_logs(p_limit IN NUMBER, p_offset IN NUMBER, p_logs OUT SYS_REFCURSOR) AS
  BEGIN
    OPEN p_logs FOR
      SELECT al.log_id, al.user_id, actor.username actor_username, al.table_name, al.action,
             al.record_id, al.old_values, al.new_values, al.action_timestamp
      FROM AUDIT_LOGS al
      LEFT JOIN USERS actor ON actor.user_id = al.user_id
      ORDER BY al.action_timestamp DESC
      OFFSET p_offset ROWS FETCH NEXT p_limit ROWS ONLY;
  END get_audit_logs;

  PROCEDURE get_email_queue(p_limit IN NUMBER, p_offset IN NUMBER, p_items OUT SYS_REFCURSOR) AS
  BEGIN
    OPEN p_items FOR
      SELECT eq.email_id, eq.requester_user_id, requester.username requester_username, eq.recipient_email,
             eq.subject, eq.status, eq.error_message, eq.queued_at, eq.sent_at
      FROM EMAIL_QUEUE eq
      LEFT JOIN USERS requester ON requester.user_id = eq.requester_user_id
      ORDER BY CASE eq.status WHEN 'failed' THEN 1 WHEN 'pending' THEN 2 WHEN 'sending' THEN 3 ELSE 4 END,
               eq.queued_at DESC
      OFFSET p_offset ROWS FETCH NEXT p_limit ROWS ONLY;
  END get_email_queue;
END PKG_ADMIN;
/
