--HIVE PG 查表清单
SELECT
    tbl."TBL_NAME" AS tbl_name -- 表名
     ,tbl_params."PARAM_VALUE" AS tbl_comment -- 表注释
     ,db."NAME" AS db_name -- 数据库名
FROM
    "SDS" SDS
        LEFT JOIN "TBLS" tbl ON sds."SD_ID" = tbl."SD_ID"
        LEFT JOIN "TABLE_PARAMS" tbl_params ON tbl."TBL_ID" = tbl_params."TBL_ID" AND tbl_params."PARAM_KEY" = 'comment'
        LEFT JOIN "PARTITION_KEYS" partkey ON tbl."TBL_ID" = partkey."TBL_ID"
        LEFT JOIN "DBS" db ON tbl."DB_ID" = db."DB_ID" -- 过滤数据库
WHERE
    tbl."TBL_NAME" IS NOT NULL
--and     db.name in ('dwd')
;

--HIVE PG 查字段
SELECT
    tbl."TBL_NAME" AS tbl_name -- 表名
     ,tbl_params."PARAM_VALUE" AS tbl_comment -- 表注释
     ,col."COLUMN_NAME" AS col_name -- 字段名称
     ,col."COMMENT" AS col_comment -- 字段注释
     ,col."TYPE_NAME" AS column_type -- 字段类型
     ,col."INTEGER_IDX" AS column_sequence -- 字段值
     ,db."NAME" AS db_name
FROM
    "SDS" sds
        LEFT JOIN "TBLS" tbl ON sds."SD_ID" = tbl."SD_ID"
        LEFT JOIN "TABLE_PARAMS" tbl_params ON tbl."TBL_ID" = tbl_params."TBL_ID" AND tbl_params."PARAM_KEY" = 'comment'
        LEFT JOIN "PARTITION_KEYS" partkey ON tbl."TBL_ID" = partkey."TBL_ID"
        LEFT JOIN "DBS" db ON tbl."DB_ID" = db."DB_ID"
        LEFT JOIN "COLUMNS_V2" col ON sds."CD_ID" = col."CD_ID" -- 过滤数据库
WHERE
    tbl."TBL_NAME" IS NOT NULL
ORDER BY tbl_name ASC
;