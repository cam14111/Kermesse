-- KERMESSE — Durcissement sécurité (suite aux advisors Supabase)
-- Idempotent et ré-exécutable.

-- 1) search_path fixe sur la fonction trigger (lint function_search_path_mutable).
CREATE OR REPLACE FUNCTION kermesse_check_slot_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_current_count  INT;
  v_max_volunteers INT;
BEGIN
  SELECT max_volunteers INTO v_max_volunteers
  FROM kermesse_slots
  WHERE id = NEW.slot_id
  FOR UPDATE;

  SELECT COUNT(*) INTO v_current_count
  FROM kermesse_signups
  WHERE slot_id = NEW.slot_id;

  IF v_current_count >= v_max_volunteers THEN
    RAISE EXCEPTION 'Créneau complet : % bénévole(s) maximum pour ce créneau.',
      v_max_volunteers;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Remplace la vue SECURITY DEFINER par une fonction SECURITY DEFINER
--    (lint security_definer_view). Même résultat : compteurs globaux par créneau,
--    sans exposer les inscriptions individuelles (la RLS de kermesse_signups reste
--    intacte). Réservée aux utilisateurs authentifiés.
DROP VIEW IF EXISTS kermesse_slot_fill_rate;

CREATE OR REPLACE FUNCTION kermesse_slot_fill_rate()
RETURNS TABLE (
  slot_id        UUID,
  stand_id       UUID,
  start_time     TIME,
  end_time       TIME,
  max_volunteers INT,
  current_count  BIGINT,
  remaining      BIGINT,
  is_full        BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sl.id,
    sl.stand_id,
    sl.start_time,
    sl.end_time,
    sl.max_volunteers,
    COUNT(sg.id)                       AS current_count,
    sl.max_volunteers - COUNT(sg.id)   AS remaining,
    COUNT(sg.id) >= sl.max_volunteers  AS is_full
  FROM kermesse_slots sl
  LEFT JOIN kermesse_signups sg ON sg.slot_id = sl.id
  GROUP BY sl.id;
$$;

REVOKE EXECUTE ON FUNCTION kermesse_slot_fill_rate() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION kermesse_slot_fill_rate() TO authenticated;

-- 3) Restreint l'exécution des RPC SECURITY DEFINER aux utilisateurs authentifiés
--    (lint anon_security_definer_function_executable). Ces fonctions s'auto-protègent
--    déjà (vérification de auth.uid()/auth.email()/rôle admin) ; on retire toutefois
--    l'accès anonyme par principe de moindre privilège.
REVOKE EXECUTE ON FUNCTION kermesse_bootstrap_admin(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION kermesse_bootstrap_admin(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION kermesse_ensure_volunteer_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION kermesse_ensure_volunteer_role() TO authenticated;

REVOKE EXECUTE ON FUNCTION kermesse_admin_signup_details(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION kermesse_admin_signup_details(UUID) TO authenticated;
