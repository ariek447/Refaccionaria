-- =====================================================================
-- Datos de ejemplo (OPCIONAL) para la demostración.
-- Ejecutar DESPUÉS de schema.sql en Supabase > SQL Editor.
-- =====================================================================

insert into public.users (first_name, last_name, phone, email, address) values
  ('Juan',  'Pérez',    '6141234567', 'juan@example.com',  'Chihuahua, Chihuahua'),
  ('María', 'González', '6147654321', 'maria@example.com', 'Cd. Juárez, Chihuahua'),
  ('Luis',  'Ramírez',  '6149876543', null,                'Delicias, Chihuahua');

insert into public.cars (user_id, brand, model, year, color, license_plate, vin)
select id, 'Nissan', 'Versa', 2019, 'Blanco', 'EFG-123-A', '3N1CN7AD5KL800001' from public.users where email = 'juan@example.com'
union all
select id, 'Ford', 'Ranger', 2021, 'Gris', 'EFH-456-B', '1FTER4FH5MLD00002' from public.users where email = 'juan@example.com'
union all
select id, 'Chevrolet', 'Aveo', 2018, 'Rojo', 'EFJ-789-C', '3G1TA5AF8JL000003' from public.users where email = 'maria@example.com';

insert into public.parts (name, description, category, brand, part_number, price, stock) values
  ('Filtro de aceite',        'Filtro de aceite para motor 1.6L', 'Filtros',     'Bosch',  'BOS-0451103',  149.00, 25),
  ('Balatas delanteras',      'Juego de balatas cerámicas',       'Frenos',      'Brembo', 'BRE-P56048',   899.50,  3),
  ('Bujía de iridio',         'Bujía de larga duración',          'Encendido',   'NGK',    'NGK-ILZKR7B', 185.00, 40),
  ('Amortiguador trasero',    'Amortiguador de gas',              'Suspensión',  'Monroe', 'MON-5781',     1250.00, 2),
  ('Banda de distribución',   'Kit de banda con tensor',          'Motor',       'Gates',  'GAT-TCK328',   1780.00, 0);
