CREATE OR REPLACE FUNCTION validate_filter_value_choices()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."choiceIds" IS NOT NULL THEN
    -- Check if the choices array is included in the referenced filter's choices array
    IF NOT EXISTS (
      SELECT 1
      FROM "FilterOrFilterGroup"
      WHERE id = NEW."filterId"
        AND options @> NEW."choiceIds"
    ) THEN
      RAISE EXCEPTION 'FilterValue choices are not included in the referenced filter choices';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_choices_trigger
BEFORE INSERT OR UPDATE ON "FilterValue"
FOR EACH ROW
EXECUTE FUNCTION validate_filter_value_choices();

ALTER TABLE "FilterValue" ADD CONSTRAINT choices_unique_filter_value CHECK (ARRAY_LENGTH("choiceIds", 1) = CARDINALITY("choiceIds"));

ALTER TABLE "FilterOrFilterGroup" ADD CONSTRAINT choices_unique_filter CHECK (ARRAY_LENGTH(options, 1) = CARDINALITY(options));