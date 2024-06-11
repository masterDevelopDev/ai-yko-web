ALTER TABLE
    "FilterOrFilterGroup"
ADD
    CONSTRAINT filter_parent_id_different_than_id CHECK (id <> "parentId");