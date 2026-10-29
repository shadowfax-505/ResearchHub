-- Correct trigger references to the actual foreign-key and user-follow column names.
CREATE OR REPLACE TRIGGER TRG_AUDIT_MODERATION
AFTER INSERT ON MODERATION_ACTIONS
FOR EACH ROW
DECLARE
  v_target_type MODERATION_CASES.target_type%TYPE;
BEGIN
  SELECT target_type INTO v_target_type FROM MODERATION_CASES WHERE case_id = :NEW.case_id;
  INSERT INTO MODERATION_AUDIT_LOG (action_id, moderator_id, target_type, action_type)
  VALUES (:NEW.action_id, :NEW.actor_admin_user_id, v_target_type, :NEW.action_type);
END;
/
CREATE OR REPLACE TRIGGER TRG_PREVENT_SELF_FOLLOW
BEFORE INSERT ON USER_FOLLOWS
FOR EACH ROW
BEGIN
  IF :NEW.follower_user_id = :NEW.followed_user_id THEN
    RAISE_APPLICATION_ERROR(-20001, 'A user cannot follow themselves.');
  END IF;
END;
/
