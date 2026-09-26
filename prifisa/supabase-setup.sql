-- =========================================================
-- PRIFISA · Configuración de la base de datos en Supabase
-- ---------------------------------------------------------
-- Cómo usarlo:
-- 1. Entra a tu proyecto en https://supabase.com
-- 2. Ve a "SQL Editor" (menú izquierdo)
-- 3. Pega TODO este archivo y dale a "Run"
-- 4. Luego ve a Authentication > Users > "Add user" y crea
--    tu cuenta de admin (email + contraseña). Esa será la
--    cuenta con la que entrarás en /admin/login.html
-- =========================================================

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'General',
  excerpt text not null default '',
  content text not null default '',
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mantener updated_at al día automáticamente
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_posts_updated_at on posts;
create trigger trg_posts_updated_at
before update on posts
for each row execute procedure set_updated_at();

-- Activar seguridad por fila
alter table posts enable row level security;

-- Cualquier visitante puede LEER solo publicaciones publicadas
drop policy if exists "Lectura publica de publicados" on posts;
create policy "Lectura publica de publicados"
on posts for select
to anon
using (published = true);

-- Cualquier usuario autenticado (tu cuenta admin) puede leer todo,
-- incluyendo borradores
drop policy if exists "Lectura total para admin" on posts;
create policy "Lectura total para admin"
on posts for select
to authenticated
using (true);

-- Solo usuarios autenticados pueden crear publicaciones
drop policy if exists "Admin puede crear" on posts;
create policy "Admin puede crear"
on posts for insert
to authenticated
with check (true);

-- Solo usuarios autenticados pueden editar
drop policy if exists "Admin puede editar" on posts;
create policy "Admin puede editar"
on posts for update
to authenticated
using (true)
with check (true);

-- Solo usuarios autenticados pueden borrar
drop policy if exists "Admin puede borrar" on posts;
create policy "Admin puede borrar"
on posts for delete
to authenticated
using (true);
