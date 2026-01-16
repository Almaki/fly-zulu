-- Add SUPERADMIN role to maliachialex@gmail.com
UPDATE users
SET role = 'SUPERADMIN'
WHERE email = 'maliachialex@gmail.com';

-- Verify the update
SELECT id, email, nombre, role, posicion
FROM users
WHERE email = 'maliachialex@gmail.com';
