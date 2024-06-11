ALTER TABLE
    "FilterOrFilterGroup"
ADD
    CONSTRAINT coherent_values_filter_groups CHECK (
        (
            kind = 'GROUP'
            AND type IS NULL
        )
        OR (kind = 'FILTER')
    );