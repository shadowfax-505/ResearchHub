-- Academic Requirement: Triggers and PL/SQL Functions
-- This migration adds explicit examples of BEFORE/AFTER triggers and a Function 
-- to satisfy database project requirements without harming the Node.js API.

--------------------------------------------------------
-- 1. Audit Logging Trigger (AFTER INSERT)
--------------------------------------------------------
-- First, we need an audit table to store the logs.
BEGIN
  EXECUTE IMMEDIATE q'[
    CREATE TABLE MODERATION_AUDIT_LOG (
      audit_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      action_id NUMBER NOT NULL,
      moderator_id NUMBER NOT NULL,
      target_type VARCHAR2(50) NOT NULL,
      action_type VARCHAR2(50) NOT NULL,
      logged_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
    )
  ]';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_AUDIT_MODERATION
AFTER INSERT ON MODERATION_ACTIONS
FOR EACH ROW
BEGIN
  INSERT INTO MODERATION_AUDIT_LOG (
    action_id, 
    moderator_id, 
    target_type, 
    action_type
  ) VALUES (
    :NEW.action_id,
    :NEW.moderator_id,
    :NEW.target_type,
    :NEW.action_type
  );
END;
/

--------------------------------------------------------
-- 2. Business Rule Trigger (BEFORE INSERT)
--------------------------------------------------------
-- Prevents a user from following themselves.
CREATE OR REPLACE TRIGGER TRG_PREVENT_SELF_FOLLOW
BEFORE INSERT ON USER_FOLLOWS
FOR EACH ROW
BEGIN
  IF :NEW.follower_id = :NEW.following_id THEN
    RAISE_APPLICATION_ERROR(-20001, 'A user cannot follow themselves.');
  END IF;
END;
/

--------------------------------------------------------
-- 3. Data Normalization Trigger (BEFORE INSERT OR UPDATE)
--------------------------------------------------------
-- Forces the slug in RESEARCHER_PROFILES to always be lowercase and trimmed.
CREATE OR REPLACE TRIGGER TRG_FORMAT_USER_SLUG
BEFORE INSERT OR UPDATE OF slug ON RESEARCHER_PROFILES
FOR EACH ROW
BEGIN
  :NEW.slug := LOWER(TRIM(:NEW.slug));
END;
/

--------------------------------------------------------
-- 4. PL/SQL Function
--------------------------------------------------------
-- Calculates a percentage of profile completion based on non-null fields.
CREATE OR REPLACE FUNCTION FN_CALCULATE_PROFILE_COMPLETION(p_user_id IN NUMBER)
RETURN NUMBER
IS
  v_completion NUMBER := 0;
  v_headline VARCHAR2(255);
  v_department VARCHAR2(150);
  v_position_title VARCHAR2(150);
  v_website_url VARCHAR2(500);
  v_orcid VARCHAR2(50);
BEGIN
  -- Fetch profile details
  SELECT headline, department, position_title, website_url, orcid
  INTO v_headline, v_department, v_position_title, v_website_url, v_orcid
  FROM RESEARCHER_PROFILES
  WHERE user_id = p_user_id;

  -- Add 20% for each filled field (max 100%)
  IF v_headline IS NOT NULL THEN
    v_completion := v_completion + 20;
  END IF;
  
  IF v_department IS NOT NULL THEN
    v_completion := v_completion + 20;
  END IF;

  IF v_position_title IS NOT NULL THEN
    v_completion := v_completion + 20;
  END IF;
  
  IF v_website_url IS NOT NULL THEN
    v_completion := v_completion + 20;
  END IF;
  
  IF v_orcid IS NOT NULL THEN
    v_completion := v_completion + 20;
  END IF;

  RETURN v_completion;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN 0;
END;
/
