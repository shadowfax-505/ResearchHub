BEGIN
  FOR item IN (
    SELECT 'EMPLOYER' column_name, 'VARCHAR2(255)' definition FROM dual
    UNION ALL SELECT 'LOCATION', 'VARCHAR2(255)' FROM dual
    UNION ALL SELECT 'REQUIREMENTS', 'CLOB' FROM dual
    UNION ALL SELECT 'SALARY_RANGE', 'VARCHAR2(100)' FROM dual
    UNION ALL SELECT 'EMPLOYMENT_TYPE', 'VARCHAR2(50)' FROM dual
    UNION ALL SELECT 'POSTED_BY', 'NUMBER REFERENCES USERS(user_id) ON DELETE SET NULL' FROM dual
    UNION ALL SELECT 'POSTED_AT', 'TIMESTAMP DEFAULT SYSTIMESTAMP' FROM dual
    UNION ALL SELECT 'EXPIRES_AT', 'TIMESTAMP' FROM dual
  ) LOOP
    DECLARE
      existing_count NUMBER;
    BEGIN
      SELECT COUNT(*) INTO existing_count FROM user_tab_columns
      WHERE table_name = 'JOBS' AND column_name = item.column_name;
      IF existing_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE JOBS ADD (' || item.column_name || ' ' || item.definition || ')';
      END IF;
    END;
  END LOOP;
END;
/
