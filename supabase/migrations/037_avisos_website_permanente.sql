-- Add website/link field to avisos_ocasion
ALTER TABLE avisos_ocasion ADD COLUMN IF NOT EXISTS pagina_web VARCHAR(500) DEFAULT NULL;

-- Add permanent request field
ALTER TABLE avisos_ocasion ADD COLUMN IF NOT EXISTS solicita_permanente BOOLEAN DEFAULT FALSE;
