-- =====================================================================
-- Refaccionaria - Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- USERS: clientes de la refaccionaria (NO son usuarios de login)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id          bigint generated always as identity primary key,
  first_name  varchar(80)  not null check (char_length(trim(first_name)) > 0),
  last_name   varchar(80)  not null check (char_length(trim(last_name)) > 0),
  phone       varchar(20)  not null check (char_length(trim(phone)) > 0),
  email       varchar(120),
  address     varchar(255),
  created_at  timestamptz  not null default now(),

  constraint users_email_key unique (email),
  constraint users_email_format check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- ---------------------------------------------------------------------
-- CARS: automóviles. Relación users 1 ---- N cars
-- ON DELETE RESTRICT: no se puede eliminar un cliente que tenga autos.
-- ---------------------------------------------------------------------
create table if not exists public.cars (
  id             bigint generated always as identity primary key,
  user_id        bigint       not null references public.users (id) on delete restrict,
  brand          varchar(50)  not null check (char_length(trim(brand)) > 0),
  model          varchar(50)  not null check (char_length(trim(model)) > 0),
  year           smallint     not null check (year between 1900 and 2100),
  color          varchar(30),
  license_plate  varchar(15)  not null,
  vin            varchar(17)  not null,
  created_at     timestamptz  not null default now(),

  constraint cars_license_plate_key unique (license_plate),
  constraint cars_vin_key unique (vin),
  constraint cars_vin_format check (vin ~ '^[A-HJ-NPR-Z0-9]{17}$')
);

-- Acelera la búsqueda de autos por propietario
create index if not exists cars_user_id_idx on public.cars (user_id);

-- ---------------------------------------------------------------------
-- PARTS: piezas / refacciones del inventario
-- ---------------------------------------------------------------------
create table if not exists public.parts (
  id           bigint generated always as identity primary key,
  name         varchar(100)   not null check (char_length(trim(name)) > 0),
  description  text,
  category     varchar(50),
  brand        varchar(50),
  part_number  varchar(50)    not null check (char_length(trim(part_number)) > 0),
  price        numeric(10, 2) not null default 0,
  stock        integer        not null default 0,
  created_at   timestamptz    not null default now(),

  constraint parts_part_number_key unique (part_number),
  constraint parts_price_check check (price >= 0),
  constraint parts_stock_check check (stock >= 0)
);

-- ---------------------------------------------------------------------
-- SEGURIDAD (Row Level Security)
-- El backend es el único que se conecta a Supabase, usando la service key
-- (rol service_role), que omite RLS. Habilitamos RLS SIN políticas: así la
-- anon key (pública) no puede leer ni escribir nada directamente, y toda
-- operación tiene que pasar por el backend.
-- ---------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.cars  enable row level security;
alter table public.parts enable row level security;

grant select, insert, update, delete on public.users, public.cars, public.parts to service_role;
