-- Thanks https://stackoverflow.com/a/26672812


-- Function that detects cycles
CREATE
OR REPLACE FUNCTION detect_cycle() RETURNS TRIGGER LANGUAGE plpgsql AS $func$ BEGIN IF EXISTS (
    WITH RECURSIVE search_graph("parentId", path, cycle) AS (
        -- relevant columns
        -- check ahead, makes 1 step less
        SELECT
            g."parentId",
            ARRAY [g.id, g."parentId"],
            (g.id = g."parentId")
        FROM
            "FilterOrFilterGroup" g
        WHERE
            g.id = NEW.id -- only test starting from new row
        UNION
        ALL
        SELECT
            g."parentId",
            sg.path || g."parentId",
            g."parentId" = ANY(sg.path)
        FROM
            search_graph sg
            JOIN "FilterOrFilterGroup" g ON g.id = sg."parentId"
        WHERE
            NOT sg.cycle
    )
    SELECT
    FROM
        search_graph
    WHERE
        cycle
    LIMIT
        1 -- stop evaluation at first find
) THEN RAISE EXCEPTION 'Cycle detected! A filter group cannot be a parent AND a child of another filter group';

ELSE RETURN NEW;

END IF;

END $func$;

-- Trigger that prevents cycles from happening on update or insert
CREATE TRIGGER detect_cycle_after_update
AFTER
INSERT
    OR
UPDATE
    ON "FilterOrFilterGroup" FOR EACH ROW EXECUTE PROCEDURE detect_cycle();