-- Function for Admin to update any gift details or clear reservation
-- secure_key: A simple predefined key to allow operation (MVP style)
CREATE OR REPLACE FUNCTION admin_manage_gift(
  p_id uuid,
  p_name text,
  p_price numeric,
  p_reserved_by text, -- Pass NULL to clear reservation
  p_secret_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Hardcoded admin secret for this MVP. 
  -- In production, store this in a separate secrets table or use Supabase Auth Roles.
  v_admin_secret text := 'admin123'; 
BEGIN
  IF p_secret_key != v_admin_secret THEN
    RETURN false;
  END IF;

  UPDATE public.gifts
  SET 
    name = COALESCE(p_name, name),
    price = COALESCE(p_price, price),
    reserved_by = p_reserved_by,
    -- If clearing reservation, also clear the PIN (if it exists from legacy)
    reservation_pin = CASE WHEN p_reserved_by IS NULL THEN NULL ELSE reservation_pin END
  WHERE id = p_id;

  RETURN true;
END;
$$;
