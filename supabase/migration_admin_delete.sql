-- Function to Delete a gift
CREATE OR REPLACE FUNCTION admin_delete_gift(
  p_id uuid,
  p_secret_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_secret text := 'admin123'; 
BEGIN
  IF p_secret_key != v_admin_secret THEN
    RETURN false;
  END IF;

  DELETE FROM public.gifts WHERE id = p_id;
  RETURN true;
END;
$$;
