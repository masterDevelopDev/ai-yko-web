-- Inspired by https://dba.stackexchange.com/a/294168

CREATE
OR REPLACE FUNCTION GET_RECURSIVE_FILTER_CHILDREN(filter_id text) RETURNS jsonb LANGUAGE sql STABLE PARALLEL SAFE AS $func$
SELECT
    jsonb_agg(sub)
FROM
    (
        SELECT
            *,
            CASE
                WHEN kind = 'FILTER' THEN NULL
                ELSE GET_RECURSIVE_FILTER_CHILDREN(id)
            END as children
        FROM
            "FilterOrFilterGroup"
        WHERE
            "parentId" = filter_id
        ORDER BY
            id
    ) sub $func$;