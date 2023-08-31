SELECT
    t.tabid as tbl_id,
    t.tabname AS tbl_name,
    c.comments AS tbl_comment,
    OWNER AS db_name
FROM
    systables t left join syscomms c on t.tabid = c.tabid
WHERE OWNER = 'gbasedbt';

-- coltype 以及长度 https://blog.csdn.net/qq_39280087/article/details/122584385
SELECT
    t.tabname AS tbl_name,
    '' AS tbl_comment,
    col.colname AS col_name,
    clc.comments AS col_comment,
    col.coltype AS col_type,
    col.collength AS col_len,
    col.colattr as col_attr,
    cld."default" as col_default
FROM
    syscolumns col
        left join syscolcomms clc on col.tabid=clc.tabid and col.colno=clc.colno
        left join sysdefaults cld on col.tabid=cld.tabid and col.colno=cld.colno,
    systables t
WHERE
    col.tabid = t.tabid
    and t.OWNER = 'gbasedbt'
    and upper(t.tabname) = upper('sims_student');





select * from systables;
select * from syscolumns where tabid=311;
select * from syscomms;
select * from syscolcomms;
select * from sysxtdtypes;
select * from sysdefaults;


SELECT
    t.tabname AS tbl_name,
    '' AS tbl_comment,
    col.colname AS col_name,
    clc.comments AS col_comment,
    col.coltype AS col_type,
    col.collength AS col_len,
    col.colattr as col_attr,
    cld."default" as col_default
FROM
    syscolumns col
        left join syscolcomms clc on col.tabid=clc.tabid and col.colno=clc.colno
        left join sysdefaults cld on col.tabid=cld.tabid and col.colno=cld.colno,
    systables t
WHERE
        col.tabid = t.tabid
  and t.OWNER = 'gbasedbt'
  and upper(t.tabname) = upper('SIMS_STUDENT');






DROP TABLE IF EXISTS SIMS_STUDENT;
CREATE TABLE SIMS_STUDENT(
                             COLLEGE_ID VARCHAR(32) NOT NULL,
                             CLASS_ID VARCHAR(32) NOT NULL,
                             STUDENT_ID VARCHAR(32) NOT NULL,
                             STUDENT_NAME VARCHAR(90),
                             ENG_NAME VARCHAR(90),
                             ID_CARD_NO VARCHAR(255),
                             MOBILE_PHONE VARCHAR(255),
                             GENDER VARCHAR(32) DEFAULT  'M' NOT NULL,
                             MONTHLY_SALARY DECIMAL(24,6),
                             BIRTH DATE,
                             AVATAR INTEGER,
                             HEIGHT INTEGER,
                             WEIGHT INTEGER,
                             NATION VARCHAR(32) DEFAULT  '01',
                             POLITICAL VARCHAR(32),
                             MARITAL VARCHAR(32) DEFAULT  'UNMARRIED',
                             DOMICILE_PLACE_PROVINCE VARCHAR(255),
                             DOMICILE_PLACE_CITY VARCHAR(255),
                             DOMICILE_PLACE_ADDRESS VARCHAR(255),
                             HOBBY VARCHAR(255),
                             INTRO VARCHAR(900),
                             PRESENT_ADDRESS VARCHAR(255),
                             EMAIL VARCHAR(255),
                             ENTRY_DATE DATE,
                             STATUS VARCHAR(32) DEFAULT  'Normal',
                             TENANT_ID VARCHAR(32),
                             REVISION INTEGER,
                             CREATED_BY VARCHAR(32),
                             CREATED_TIME DATE ,
                             UPDATED_BY VARCHAR(32),
                             UPDATED_TIME DATE,
                             PRIMARY KEY (STUDENT_ID)
);

COMMENT ON TABLE SIMS_STUDENT IS '学生';
COMMENT ON COLUMN SIMS_STUDENT.COLLEGE_ID IS '所在学院ID';



