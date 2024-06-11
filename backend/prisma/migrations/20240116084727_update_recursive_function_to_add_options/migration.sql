DROP FUNCTION IF EXISTS GET_RECURSIVE_FILTER_CHILDREN;

CREATE OR REPLACE FUNCTION GET_FILTERS_TREE_WITH_OPTIONS(filter_id text DEFAULT NULL) RETURNS JSONB LANGUAGE SQL STABLE PARALLEL SAFE AS $func$
SELECT
    jsonb_agg(sub)
FROM
    (
        SELECT
            f.*,
            CASE
                WHEN f.kind = 'FILTER' AND f.type IN ('SINGLE_CHOICE', 'MULTI_CHOICE') THEN (
                    SELECT jsonb_agg(json_build_object('id', c.id, 'value', c.value))
                    FROM "ChoiceFilterOption" c
                    WHERE c."filterId" = f.id AND c.active
                )
                ELSE null
            END AS options,
            CASE
                WHEN f.kind = 'FILTER' THEN null
                ELSE GET_FILTERS_TREE_WITH_OPTIONS(f.id)
            END AS children
        FROM
            "FilterOrFilterGroup" f
        WHERE
           CASE WHEN filter_id IS NULL THEN f."parentId" IS NULL ELSE f."parentId" = filter_id END
        GROUP BY f.id
    ) sub
$func$;