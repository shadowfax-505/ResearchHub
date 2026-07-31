CREATE OR REPLACE PACKAGE PKG_PROFILE AS
  PROCEDURE get_public_profile(
    p_slug IN VARCHAR2,
    p_profile OUT SYS_REFCURSOR,
    p_papers OUT SYS_REFCURSOR,
    p_questions OUT SYS_REFCURSOR
  );
  PROCEDURE get_all_researchers(
    p_limit IN NUMBER,
    p_offset IN NUMBER,
    p_out OUT SYS_REFCURSOR
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
      SELECT u.user_id, u.username, u.full_name, u.affiliation, u.country, u.profile_picture_url, u.bio, u.is_verified,
             rp.slug, rp.headline, rp.department, rp.position_title, rp.website_url, rp.orcid,
             NVL(rs.followers, 0) followers, NVL(rs.following, 0) following, NVL(rs.total_reads, 0) total_reads,
             NVL(rs.rg_score, 0) rg_score,
             (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                  'education_id' VALUE e.education_id, 'institution' VALUE e.institution, 
                  'degree' VALUE e.degree, 'field_of_study' VALUE e.field_of_study, 
                  'start_year' VALUE e.start_year, 'end_year' VALUE e.end_year
             )), '[]') FROM USER_EDUCATION e WHERE e.user_id = u.user_id) as education_json,
             (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                  'experience_id' VALUE ex.experience_id, 'company' VALUE ex.company, 
                  'position' VALUE ex.position, 'start_date' VALUE TO_CHAR(ex.start_date, 'YYYY-MM-DD'), 
                  'end_date' VALUE TO_CHAR(ex.end_date, 'YYYY-MM-DD'), 'description' VALUE TO_CHAR(ex.description)
             )), '[]') FROM USER_EXPERIENCE ex WHERE ex.user_id = u.user_id) as experience_json,
             (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                  'skill_id' VALUE s.skill_id, 'skill_name' VALUE s.skill_name
             )), '[]') FROM USER_SKILLS s WHERE s.user_id = u.user_id) as skills_json,
             (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                  'language_id' VALUE l.language_id, 'language_name' VALUE l.language_name, 'proficiency' VALUE l.proficiency
             )), '[]') FROM USER_LANGUAGES l WHERE l.user_id = u.user_id) as languages_json,
             (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                  'discipline_id' VALUE d.discipline_id, 'discipline_name' VALUE d.discipline_name
             )), '[]') FROM USER_DISCIPLINES d WHERE d.user_id = u.user_id) as disciplines_json
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

  PROCEDURE get_all_researchers(
    p_limit IN NUMBER,
    p_offset IN NUMBER,
    p_out OUT SYS_REFCURSOR
  ) AS
  BEGIN
    OPEN p_out FOR
      SELECT * FROM (
        SELECT u.user_id, u.username, u.full_name, u.affiliation, u.country, u.profile_picture_url, u.bio, u.is_verified,
               rp.slug, rp.headline, rp.department, rp.position_title, rp.website_url, rp.orcid,
               NVL(rs.followers, 0) followers, NVL(rs.following, 0) following, NVL(rs.total_reads, 0) total_reads,
               NVL(rs.rg_score, 0) rg_score,
               (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                    'education_id' VALUE e.education_id, 'institution' VALUE e.institution, 
                    'degree' VALUE e.degree, 'field_of_study' VALUE e.field_of_study, 
                    'start_year' VALUE e.start_year, 'end_year' VALUE e.end_year
               )), '[]') FROM USER_EDUCATION e WHERE e.user_id = u.user_id) as education_json,
               (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                    'experience_id' VALUE ex.experience_id, 'company' VALUE ex.company, 
                    'position' VALUE ex.position, 'start_date' VALUE TO_CHAR(ex.start_date, 'YYYY-MM-DD'), 
                    'end_date' VALUE TO_CHAR(ex.end_date, 'YYYY-MM-DD'), 'description' VALUE TO_CHAR(ex.description)
               )), '[]') FROM USER_EXPERIENCE ex WHERE ex.user_id = u.user_id) as experience_json,
               (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                    'skill_id' VALUE s.skill_id, 'skill_name' VALUE s.skill_name
               )), '[]') FROM USER_SKILLS s WHERE s.user_id = u.user_id) as skills_json,
               (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                    'language_id' VALUE l.language_id, 'language_name' VALUE l.language_name, 'proficiency' VALUE l.proficiency
               )), '[]') FROM USER_LANGUAGES l WHERE l.user_id = u.user_id) as languages_json,
               (SELECT NVL(JSON_ARRAYAGG(JSON_OBJECT(
                    'discipline_id' VALUE d.discipline_id, 'discipline_name' VALUE d.discipline_name
               )), '[]') FROM USER_DISCIPLINES d WHERE d.user_id = u.user_id) as disciplines_json,
               ROW_NUMBER() OVER (ORDER BY NVL(rs.followers, 0) DESC, u.user_id DESC) AS rn
        FROM RESEARCHER_PROFILES rp
        JOIN USERS u ON u.user_id = rp.user_id
        LEFT JOIN RESEARCHER_STATS rs ON rs.user_id = u.user_id
        WHERE rp.visibility = 'public' AND u.is_active = 1
      ) WHERE rn > NVL(p_offset, 0) AND rn <= NVL(p_offset, 0) + NVL(p_limit, 20);
  END get_all_researchers;

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
