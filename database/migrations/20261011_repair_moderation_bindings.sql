-- Native dynamic SQL binds every repeated placeholder position.
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
          USING l_new_status, l_new_status, l_new_status, p_actor_admin_user_id, l_target_id;
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
