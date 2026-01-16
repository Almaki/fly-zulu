-- Seed data for directory_entries
-- Solo para TIJ (Tijuana) y MEX (Ciudad de México)

-- MEX - Ciudad de México
INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MEX', 'radial', 'Radial Volaris MEX', 'Frecuencia principal de operaciones', '5555123456', '5555123456', 'Terminal 1', 4.5, 10, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MEX', 'taxi', 'Taxi Amarillo Confianza', 'Servicio 24/7, tarifa fija a zona centro', '5551234567', '5551234567', 'Sitio Terminal 1', 4.2, 15, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MEX', 'hotel', 'Hilton Airport MEX', 'Hotel dentro del aeropuerto, conexión directa T1', '5552345678', '5552345678', 'Dentro de Terminal 1', 4.8, 25, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MEX', 'food', 'Sanborns T2', 'Comida mexicana, abierto 6am-10pm', '5553456789', null, 'Terminal 2, Nivel Salidas', 3.9, 8, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MEX', 'airport', 'Oficina Volaris MEX', 'Atención a tripulación', '5554567890', '5554567890', 'Terminal 1, Oficinas corporativas', 4.0, 5, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

-- TIJ - Tijuana
INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'TIJ', 'radial', 'Radial Volaris TIJ', 'Operaciones Tijuana', '6641234567', '6641234567', 'Terminal Nacional', 4.1, 5, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'TIJ', 'taxi', 'Taxi Libre Seguro', 'Servicio a zona centro y San Diego', '6642345678', '6642345678', null, 4.0, 10, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'TIJ', 'hotel', 'Real Inn Tijuana', 'Hotel económico cerca del aeropuerto', '6643456789', '6643456789', 'Paseo de los Héroes 10902', 3.8, 8, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'TIJ', 'food', 'Tacos El Gordo', 'Tacos de adobada, abierto hasta tarde', '6644567890', null, 'Blvd. Agua Caliente', 4.5, 20, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'TIJ', 'airport', 'Oficina Volaris TIJ', 'Atención a tripulación Tijuana', '6645678901', '6645678901', 'Terminal, Nivel Superior', 4.0, 3, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;
