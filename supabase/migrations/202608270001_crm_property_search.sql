alter table public.properties
  add column if not exists source_system text,
  add column if not exists source_id text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists last_synced_at timestamptz,
  add column if not exists is_active boolean not null default true,
  add column if not exists search_property_type text,
  add column if not exists search_tenure text,
  add column if not exists search_features text[] not null default '{}';

update public.properties
set source_system = coalesce(source_system, 'expert_agent'),
    source_id = coalesce(source_id, expert_agent_id, id::text),
    last_synced_at = coalesce(last_synced_at, updated_at, created_at),
    search_tenure = coalesce(search_tenure, 'unknown')
where source_system is null
   or source_id is null
   or last_synced_at is null
   or search_tenure is null;

alter table public.properties
  alter column source_system set not null,
  alter column source_id set not null,
  alter column last_synced_at set not null;

create unique index if not exists properties_source_identity_idx
  on public.properties (source_system, source_id);
create index if not exists properties_public_search_idx
  on public.properties (department, is_active, status, price);
create index if not exists properties_search_features_idx
  on public.properties using gin (search_features);

create table if not exists public.crm_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  status text not null check (status in ('success', 'failure')),
  records_read integer not null default 0,
  records_written integer not null default 0,
  records_deactivated integer not null default 0,
  error_summary text,
  created_at timestamptz not null default now()
);
alter table public.crm_sync_runs enable row level security;

create or replace function public.search_properties(
  p_department text,
  p_location text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_min_bedrooms integer default null,
  p_min_bathrooms integer default null,
  p_property_types text[] default '{}',
  p_tenures text[] default '{}',
  p_features text[] default '{}',
  p_statuses text[] default '{}',
  p_sort text default 'default',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table(property jsonb, total_count bigint)
language sql
stable
security invoker
as $function$
  with filtered_properties as (
    select p.*, count(*) over() as total_count
    from public.properties p
    where p.is_active = true
      and p.department = p_department
      and (cardinality(p_statuses) = 0 or p.status = any(p_statuses))
      and (p_min_price is null or p.price >= p_min_price)
      and (p_max_price is null or p.price <= p_max_price)
      and (p_min_bedrooms is null or p.bedrooms >= p_min_bedrooms)
      and (p_min_bathrooms is null or p.bathrooms >= p_min_bathrooms)
      and (cardinality(p_property_types) = 0 or p.search_property_type = any(p_property_types))
      and (cardinality(p_tenures) = 0 or p.search_tenure = any(p_tenures))
      and (cardinality(p_features) = 0 or p.search_features @> p_features)
      and (
        p_location is null
        or btrim(p_location) = ''
        or lower(concat_ws(' ', p.title, p.address)) like '%' ||
           replace(replace(replace(lower(btrim(p_location)), '\', '\\'), '%', '\%'), '_', '\_') || '%'
           escape '\'
        or replace(lower(coalesce(p.postcode, '')), ' ', '') like '%' ||
           replace(replace(replace(replace(lower(btrim(p_location)), '\', '\\'), '%', '\%'), '_', '\_'), ' ', '') || '%'
           escape '\'
      )
  ),
  paged_properties as (
    select to_jsonb(p) as property, p.total_count
    from filtered_properties p
    order by
      case when p_sort = 'price_asc' then p.price end asc nulls last,
      case when p_sort = 'price_desc' then p.price end desc nulls last,
      coalesce(p.source_updated_at, p.created_at) desc,
      p.source_system asc,
      p.source_id asc
    limit least(greatest(p_limit, 1), 48)
    offset greatest(p_offset, 0)
  )
  select property, total_count
  from paged_properties
  union all
  select null::jsonb, coalesce((select max(total_count) from filtered_properties), 0)
  where not exists (select 1 from paged_properties);
$function$;

grant execute on function public.search_properties(
  text, text, numeric, numeric, integer, integer,
  text[], text[], text[], text[], text, integer, integer
) to anon, authenticated;
