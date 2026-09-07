create table if not exists public.bikes (
  id text primary key,
  brand text not null,
  model text not null,
  year integer not null default extract(year from now())::integer,
  "engineCc" integer not null default 150,
  selling_price numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  downpayment numeric(12, 2) not null default 0,
  doc_charge_pct numeric(5, 2) not null default 5,
  insurance numeric(12, 2) not null default 0,
  rmv numeric(12, 2) not null default 0,
  period integer not null default 36,
  interest_rate numeric(5, 2) not null default 14.5,
  status text not null default 'Available',
  category text,
  image_url text,
  updated_at timestamptz not null default now()
);

alter table public.bikes enable row level security;

drop policy if exists "Public can view available bikes" on public.bikes;
create policy "Public can view available bikes"
  on public.bikes for select
  using (true);

drop policy if exists "Authenticated admins can insert bikes" on public.bikes;
create policy "Authenticated admins can insert bikes"
  on public.bikes for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update bikes" on public.bikes;
create policy "Authenticated admins can update bikes"
  on public.bikes for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can delete bikes" on public.bikes;
create policy "Authenticated admins can delete bikes"
  on public.bikes for delete
  to authenticated
  using (true);

create or replace function public.set_bikes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bikes_updated_at on public.bikes;
create trigger bikes_updated_at
  before update on public.bikes
  for each row execute function public.set_bikes_updated_at();
