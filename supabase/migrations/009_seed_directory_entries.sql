-- Seed data for directory_entries
-- Run this migration to populate the directory with sample data

-- First, we need a user to be the creator.
-- This uses a placeholder that should be replaced with an actual user ID
-- Or you can run this after creating a user

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

-- GDL - Guadalajara
INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'GDL', 'radial', 'Radial Volaris GDL', 'Frecuencia operaciones Guadalajara', '3331234567', '3331234567', 'Terminal Nacional', 4.3, 8, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'GDL', 'taxi', 'Uber Miguel - GDL', 'Conductor verificado, conoce rutas a hoteles', '3332345678', '3332345678', null, 4.7, 20, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'GDL', 'hotel', 'Holiday Inn Express GDL', 'Shuttle gratuito al aeropuerto', '3333456789', '3333456789', 'Av. López Mateos Sur 2375', 4.4, 12, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'GDL', 'food', 'Tortas Ahogadas El Güero', 'Comida rápida, cerca del aeropuerto', '3334567890', null, 'Carretera a Chapala km 5', 4.6, 18, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

-- CUN - Cancún
INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'CUN', 'radial', 'Radial Volaris CUN', 'Operaciones Cancún', '9981234567', '9981234567', 'Terminal 4', 4.4, 6, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'CUN', 'taxi', 'Transfer Carlos - CUN', 'Van privada, ideal para grupos', '9982345678', '9982345678', null, 4.9, 30, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'CUN', 'hotel', 'Courtyard by Marriott CUN', 'Cerca del aeropuerto, buen descanso', '9983456789', '9983456789', 'Blvd. Luis Donaldo Colosio km 12', 4.5, 15, id, true
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

-- MTY - Monterrey
INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MTY', 'radial', 'Radial Volaris MTY', 'Operaciones Monterrey', '8181234567', '8181234567', 'Terminal A', 4.2, 7, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MTY', 'taxi', 'Uber Premium Roberto', 'SUV, conoce hoteles de tripulación', '8182345678', '8182345678', null, 4.8, 22, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MTY', 'hotel', 'Fiesta Inn Aeropuerto MTY', 'Shuttle incluido, gym 24hrs', '8183456789', '8183456789', 'Carretera Miguel Alemán km 24', 4.3, 14, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'MTY', 'food', 'El Rey del Cabrito', 'Cabrito y carne asada, típico de MTY', '8184567890', null, 'Av. Constitución 1100', 4.7, 25, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

-- PVR - Puerto Vallarta
INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'PVR', 'radial', 'Radial Volaris PVR', 'Operaciones Puerto Vallarta', '3221234567', '3221234567', 'Terminal Nacional', 4.0, 4, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'PVR', 'taxi', 'Transfer Playa - PVR', 'Servicio a Zona Hotelera y Nuevo Vallarta', '3222345678', '3222345678', null, 4.5, 12, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;

INSERT INTO directory_entries (airport_code, category, name, description, phone, whatsapp, address, rating, rating_count, created_by, is_verified)
SELECT
  'PVR', 'hotel', 'Crown Plaza PVR', 'Frente al mar, descuento tripulación', '3223456789', '3223456789', 'Zona Hotelera Norte', 4.6, 18, id, true
FROM users WHERE role = 'SUPERADMIN' LIMIT 1;
