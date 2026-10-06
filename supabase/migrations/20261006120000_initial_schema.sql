-- Overset: copia en la nube de los datos de cada usuario.
--
-- El teléfono (SQLite) es la fuente de verdad; estas tablas reflejan las suyas columna por columna para que
-- sincronizar sea copiar filas. Reglas comunes a todas:
--   * Clave (user_id, id): varios ids son estables y solo únicos por usuario (el peso de un día es su fecha).
--   * updated_at: milisegundos que pone el teléfono al modificar la fila. Gana la modificación más reciente.
--   * deleted_at: borrado lógico. El teléfono borra de verdad y avisa aquí; así otros teléfonos se enteran.
--   * synced_at: hora del servidor en cada escritura. Es el cursor con el que un teléfono pide "lo nuevo".
--   * Sin claves foráneas entre tablas: el orden de llegada no importa. Las cascadas de borrado van en triggers.
--   * RLS: cada usuario solo ve y escribe sus filas.

-- ---------------------------------------------------------------------------------------------------------
-- Funciones compartidas
-- ---------------------------------------------------------------------------------------------------------

-- Antes de escribir: descarta una modificación más vieja que la guardada y sella la hora del servidor.
create function public.sync_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return null;
  end if;
  new.synced_at := now();
  return new;
end;
$$;

-- Al borrar un padre, borra sus hijos. Argumentos: tabla hija y su columna que apunta al padre.
create function public.cascade_soft_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    execute format(
      'update public.%I
          set deleted_at = $1, updated_at = greatest(updated_at, $1)
        where user_id = $2 and %I = $3 and deleted_at is null',
      tg_argv[0], tg_argv[1]
    ) using new.deleted_at, new.user_id, new.id;
  end if;
  return null;
end;
$$;

-- Al borrar un día del plan, sus sesiones se conservan pero dejan de apuntar a él (como en el teléfono).
create function public.detach_sessions_from_deleted_day()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    update public.sessions
       set plan_day_id = null, updated_at = greatest(updated_at, new.deleted_at)
     where user_id = new.user_id and plan_day_id = new.id;
  end if;
  return null;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------
-- Plan
-- ---------------------------------------------------------------------------------------------------------

create table public.plans (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  repeats_weekly boolean not null default true,
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.plan_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  plan_id text not null,
  weekday integer not null check (weekday between 0 and 6),
  name text not null,
  sort_order integer not null,
  default_sets integer not null,
  default_reps integer not null,
  default_rest_sec integer not null,
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.plan_exercises (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  plan_day_id text not null,
  exercise_id text not null,
  sort_order integer not null,
  sets integer not null,
  reps integer,
  seconds integer,
  rest_sec integer not null,
  target_weight double precision,
  unit text not null check (unit in ('lb', 'kg')),
  load_type text not null check (load_type in ('per_arm', 'total', 'plates', 'bodyweight', 'time')),
  progression_rule text,
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------------------------------------
-- Entrenos
-- ---------------------------------------------------------------------------------------------------------

create table public.sessions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  plan_day_id text,
  date text not null,
  started_at bigint not null,
  ended_at bigint,
  origin text not null default 'app' check (origin in ('app', 'import')),
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.set_logs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  session_id text not null,
  exercise_id text not null,
  set_index integer not null,
  weight double precision,
  unit text not null check (unit in ('lb', 'kg')),
  load_type text not null check (load_type in ('per_arm', 'total', 'plates', 'bodyweight', 'time')),
  reps integer,
  seconds integer,
  rpe double precision,
  completed boolean not null default false,
  is_pr boolean not null default false,
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.exercise_swaps (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  date text not null,
  plan_exercise_id text not null,
  exercise_id text not null,
  target_weight double precision,
  unit text not null check (unit in ('lb', 'kg')),
  load_type text not null check (load_type in ('per_arm', 'total', 'plates', 'bodyweight', 'time')),
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------------------------------------
-- Cuerpo, ajustes y ejercicios propios
-- ---------------------------------------------------------------------------------------------------------

create table public.body_weights (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  date text not null,
  weight double precision not null,
  unit text not null check (unit in ('lb', 'kg')),
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.equipment_increments (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  equipment text not null check (equipment in ('dumbbell', 'machine', 'plates')),
  unit text not null check (unit in ('lb', 'kg')),
  step double precision not null,
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Ajustes del usuario (idioma, unidad, recordatorios...). El id es la clave del ajuste.
create table public.user_settings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  value text not null,
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Solo los ejercicios que crea el usuario. El catálogo viene dentro de la app y no se guarda aquí;
-- por eso exercise_id en las demás tablas es texto libre ("fedb:Barbell_Squat" o el id de una fila de esta tabla).
create table public.custom_exercises (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  name_es text not null,
  name_en text not null,
  pattern text,
  equipment text not null,
  default_load_type text not null check (default_load_type in ('per_arm', 'total', 'plates', 'bodyweight', 'time')),
  aliases text not null default '[]',
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------------------------------------
-- Lo mismo para todas las tablas: guardia de escritura, índice del cursor y RLS
-- ---------------------------------------------------------------------------------------------------------

do $$
declare
  synced_table text;
begin
  foreach synced_table in array array[
    'plans', 'plan_days', 'plan_exercises', 'sessions', 'set_logs', 'exercise_swaps',
    'body_weights', 'equipment_increments', 'user_settings', 'custom_exercises'
  ]
  loop
    execute format(
      'create trigger sync_guard before insert or update on public.%I
         for each row execute function public.sync_guard()',
      synced_table
    );
    execute format(
      'create index %I on public.%I (user_id, synced_at)',
      synced_table || '_sync_idx', synced_table
    );
    -- Permisos explícitos: solo usuarios con sesión; nada para visitantes anónimos.
    execute format('revoke all on public.%I from anon', synced_table);
    execute format('grant select, insert, update, delete on public.%I to authenticated', synced_table);
    execute format('alter table public.%I enable row level security', synced_table);
    execute format(
      'create policy "Each user manages their own rows" on public.%I
         for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))',
      synced_table
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------
-- Cascadas de borrado (las mismas que aplica SQLite en el teléfono)
-- ---------------------------------------------------------------------------------------------------------

create trigger cascade_to_plan_days
  after update of deleted_at on public.plans
  for each row execute function public.cascade_soft_delete('plan_days', 'plan_id');

create trigger cascade_to_plan_exercises
  after update of deleted_at on public.plan_days
  for each row execute function public.cascade_soft_delete('plan_exercises', 'plan_day_id');

create trigger detach_sessions
  after update of deleted_at on public.plan_days
  for each row execute function public.detach_sessions_from_deleted_day();

create trigger cascade_to_exercise_swaps
  after update of deleted_at on public.plan_exercises
  for each row execute function public.cascade_soft_delete('exercise_swaps', 'plan_exercise_id');

create trigger cascade_to_set_logs
  after update of deleted_at on public.sessions
  for each row execute function public.cascade_soft_delete('set_logs', 'session_id');

-- Índices de las columnas por las que buscan las cascadas.
create index plan_days_plan_idx on public.plan_days (user_id, plan_id);
create index plan_exercises_day_idx on public.plan_exercises (user_id, plan_day_id);
create index exercise_swaps_plan_exercise_idx on public.exercise_swaps (user_id, plan_exercise_id);
create index set_logs_session_idx on public.set_logs (user_id, session_id);
create index sessions_plan_day_idx on public.sessions (user_id, plan_day_id);
