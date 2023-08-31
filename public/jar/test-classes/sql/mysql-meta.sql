SELECT
    table_name AS tbl_name,
    table_comment AS tbl_comment,
    table_schema AS db_name
FROM
    information_schema.TABLES
WHERE
        table_schema = 'are'
  AND table_type = 'BASE TABLE';


SELECT
    table_name AS tbl_name,
    '' AS tbl_comment,
    column_name AS col_name,
    column_comment AS col_comment,
    data_type AS data_type,
    character_maximum_length AS col_str_length,
    numeric_precision AS col_num_length,
    numeric_scale AS col_num_scale,
    is_nullable AS is_nullable,
    column_key AS is_primary_key,
    column_default AS default_value,
    column_type AS data_type_text
FROM
    information_schema.COLUMNS
WHERE
        table_schema = 'are';