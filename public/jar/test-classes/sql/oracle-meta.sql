select * from all_tables where OWNER='UCREDIT';
select  *  from  all_tab_columns where OWNER='UCREDIT';
select  *  from  all_tab_comments where OWNER='UCREDIT';
select  *  from  ALL_COL_COMMENTS where OWNER='UCREDIT';


SELECT
    t.table_name AS tbl_name,
    c.comments AS tbl_comment,
    t.OWNER AS db_name
FROM all_tables t left join all_tab_comments c on t.OWNER=c.OWNER and t.TABLE_NAME=c.TABLE_NAME
where t.OWNER='UCREDIT';

SELECT
    col.table_name AS tbl_name,
    '' AS tbl_comment,
    col.column_name AS col_name,
    clc.comments AS col_comment,
    col.data_type AS data_type,
    col.data_length as data_length,
    col.data_precision AS data_precision,
    col.data_scale AS data_scale,
    col.nullable AS is_nullable,
    '' AS is_primary_key,
    col.data_default AS default_value
FROM
    all_tab_columns col
        LEFT JOIN all_col_comments clc ON col.table_name = clc.table_name
        AND col.column_name = clc.column_name
WHERE
        col.OWNER = 'UCREDIT'
  AND UPPER(col.table_name) = 'CUST_BASE';