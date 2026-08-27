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

create or replace function public.reconcile_property_source_feed(
  p_source_system text,
  p_rows jsonb,
  p_source_ids text[],
  p_started_at timestamptz
)
returns table(
  records_read integer,
  records_written integer,
  records_deactivated integer,
  finished_at timestamptz
)
language plpgsql
security invoker
as $function$
declare
  v_finished_at timestamptz := clock_timestamp();
  v_records_read integer;
  v_records_written integer;
  v_records_deactivated integer;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'source feed rows must be a non-empty array';
  end if;

  if jsonb_array_length(p_rows) = 0 then
    raise exception 'source feed rows must be a non-empty array';
  end if;

  v_records_read := jsonb_array_length(p_rows);
  if coalesce(cardinality(p_source_ids), 0) <> v_records_read
     or cardinality(p_source_ids) <> (select count(distinct source_id) from unnest(p_source_ids) as source_id)
     or (select count(distinct row_data->>'source_id') from jsonb_array_elements(p_rows) as row_data) <> v_records_read
     or exists (
       select 1
       from jsonb_array_elements(p_rows) as row_data
       where nullif(btrim(row_data->>'source_id'), '') is null
          or row_data->>'source_system' is distinct from p_source_system
          or not (row_data->>'source_id' = any(p_source_ids))
     ) then
    raise exception 'source feed rows and source IDs do not match';
  end if;

  insert into public.properties
  select (
    jsonb_populate_record(
      null::public.properties,
      row_data || jsonb_build_object(
        'id', gen_random_uuid(),
        'source_system', p_source_system,
        'last_synced_at', v_finished_at,
        'is_active', true,
        'created_at', v_finished_at,
        'updated_at', v_finished_at
      )
    )
  ).*
  from jsonb_array_elements(p_rows) as row_data
  on conflict (source_system, source_id) do update set
    expert_agent_id = excluded.expert_agent_id,
    source_updated_at = excluded.source_updated_at,
    last_synced_at = excluded.last_synced_at,
    is_active = excluded.is_active,
    search_property_type = excluded.search_property_type,
    search_tenure = excluded.search_tenure,
    search_features = excluded.search_features,
    title = excluded.title,
    address = excluded.address,
    postcode = excluded.postcode,
    price = excluded.price,
    price_qualifier = excluded.price_qualifier,
    status = excluded.status,
    department = excluded.department,
    property_type = excluded.property_type,
    bedrooms = excluded.bedrooms,
    bathrooms = excluded.bathrooms,
    receptions = excluded.receptions,
    sqft = excluded.sqft,
    description = excluded.description,
    features = excluded.features,
    images = excluded.images,
    epc_rating = excluded.epc_rating,
    epc_image_url = excluded.epc_image_url,
    tenure = excluded.tenure,
    brochure_url = excluded.brochure_url,
    virtual_tour_url = excluded.virtual_tour_url,
    rooms = excluded.rooms,
    floorplans = excluded.floorplans,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    updated_at = excluded.updated_at;
  get diagnostics v_records_written = row_count;

  update public.properties
  set is_active = false,
      last_synced_at = v_finished_at,
      updated_at = v_finished_at
  where source_system = p_source_system
    and is_active = true
    and not (source_id = any(p_source_ids));
  get diagnostics v_records_deactivated = row_count;

  insert into public.crm_sync_runs (
    source_system,
    started_at,
    finished_at,
    status,
    records_read,
    records_written,
    records_deactivated
  ) values (
    p_source_system,
    p_started_at,
    v_finished_at,
    'success',
    v_records_read,
    v_records_written,
    v_records_deactivated
  );

  return query select
    v_records_read,
    v_records_written,
    v_records_deactivated,
    v_finished_at;
end;
$function$;

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
