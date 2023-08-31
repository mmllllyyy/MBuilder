SELECT
    tb.TABLE_NAME as tbl_name,
    d.description as tbl_comment,
    tb.table_schema as db_name
FROM
    information_schema.tables tb
        JOIN pg_class C ON C.relname = tb.
        TABLE_NAME LEFT JOIN pg_description d ON d.objoid = C.oid
        AND d.objsubid = '0'
WHERE
        tb.table_schema = 'public';


SELECT c.relname AS tbl_name,
       CAST ( obj_description ( c.relfilenode, 'pg_class' ) AS VARCHAR ) AS tbl_comment,
       b.schemaname AS db_name
FROM pg_class AS c,
     pg_tables AS b
WHERE
        c.relname = b.tablename
  AND b.schemaname='public';

-----------------
SELECT
    col.TABLE_NAME as tbl_name,
    '' as tbl_comment,
    col.ordinal_position AS col_index,
    col.COLUMN_NAME as col_name,
    d.description as col_comment,
    col.udt_name as data_type ,
    col.character_maximum_length as data_length,
    col.numeric_scale as num_scale,
    col.is_identity as is_primary_key,
    col.is_nullable as is_nullable,
    col.column_default as default_value
FROM
    information_schema.COLUMNS col
        JOIN pg_class C ON C.relname = col.
        TABLE_NAME LEFT JOIN pg_description d ON d.objoid = C.oid
        AND d.objsubid = col.ordinal_position
WHERE
        1 = 1
  AND col.table_schema = 'public'
  AND UPPER(col.TABLE_NAME)='SIMS_EXAM'
ORDER BY
    col.ordinal_position asc


