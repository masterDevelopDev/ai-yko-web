CREATE OR REPLACE FUNCTION validate_filter_value_choices()
RETURNS TRIGGER AS $$
DECLARE
  filter_choices TEXT[];
BEGIN
  IF NEW."choiceIds" IS NOT NULL THEN
    -- Récupérer les choix du filtre
    SELECT options INTO filter_choices
    FROM "FilterOrFilterGroup"
    WHERE id = NEW."filterId";
    
    -- Vérifier si le tableau de choix est inclus dans les choix du filtre référencé
    IF NOT filter_choices @> NEW."choiceIds" THEN
      RAISE EXCEPTION 'FilterValue choices are not included in the referenced filter choices:: % (FilterId: %, Choices du Filtre: %)',
        array_to_string(NEW."choiceIds", ','),
        NEW."filterId",
        array_to_string(filter_choices, ',');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;