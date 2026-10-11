-- Give the effective primary role the same vocabulary as the role-management UI.
BEGIN
  FOR item IN (SELECT constraint_name FROM user_constraints
    WHERE table_name = 'USERS' AND constraint_type = 'C'
      AND LOWER(search_condition_vc) LIKE '%role%in%') LOOP
    EXECUTE IMMEDIATE 'ALTER TABLE USERS DROP CONSTRAINT ' || DBMS_ASSERT.SIMPLE_SQL_NAME(item.constraint_name);
  END LOOP;
  EXECUTE IMMEDIATE 'ALTER TABLE USERS ADD CONSTRAINT ck_users_primary_role CHECK (role IN (''researcher'', ''student'', ''librarian'', ''moderator'', ''admin''))';
END;
/
