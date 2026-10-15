-- Días de entreno perdidos: si se hicieron otro día de la misma semana (y los siguientes se corrieron) o
-- se dejaron pasar. El id es la fecha del día perdido. Sin claves foráneas: la semana se calcula con el plan
-- vigente, así que una fila nunca apunta a algo que pueda desaparecer.

create table public.schedule_shifts (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  date text not null,
  target_date text,
  updated_at bigint not null,
  deleted_at bigint,
  synced_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Lo mismo que reciben las demás tablas sincronizadas en la migración inicial.
create trigger sync_guard before insert or update on public.schedule_shifts
  for each row execute function public.sync_guard();

create index schedule_shifts_sync_idx on public.schedule_shifts (user_id, synced_at);

revoke all on public.schedule_shifts from anon;
grant select, insert, update, delete on public.schedule_shifts to authenticated;
alter table public.schedule_shifts enable row level security;

create policy "Each user manages their own rows" on public.schedule_shifts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
