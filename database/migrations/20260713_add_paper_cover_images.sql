BEGIN
  DECLARE
    existing_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM user_tab_columns
    WHERE table_name = 'RESEARCH_PAPERS' AND column_name = 'COVER_IMAGE_URL';
    IF existing_count = 0 THEN
      EXECUTE IMMEDIATE 'ALTER TABLE RESEARCH_PAPERS ADD (COVER_IMAGE_URL VARCHAR2(1000))';
    END IF;
  END;
END;
/
