begin;

drop function if exists public.search_properties(
  text, text, numeric, numeric, integer, integer, integer,
  text[], text[], text[], text[], text, integer, integer
);

-- Radius search. The caller geocodes the typed location (postcodes.io covers
-- postcodes, outcodes and place names without a key) and passes the centre
-- here. Distance is haversine in miles rather than PostGIS, which this
-- project does not enable; at Hertfordshire scale the error is metres.
--
-- A live centre replaces the text match rather than narrowing it: a visitor
-- asking for "within 3 miles of Cuffley" wants everything near that point,
-- including streets whose address never says Cuffley.
create or replace function public.search_properties(
  p_department text,
  p_location text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_min_bedrooms integer default null,
  p_max_bedrooms integer default null,
  p_min_bathrooms integer default null,
  p_property_types text[] default '{}',
  p_tenures text[] default '{}',
  p_features text[] default '{}',
  p_statuses text[] default '{}',
  p_sort text default 'default',
  p_limit integer default 24,
  p_offset integer default 0,
  p_centre_lat double precision default null,
  p_centre_lng double precision default null,
  p_radius_miles double precision default null
)
returns table(property jsonb, total_count bigint)
language sql
stable
security invoker
as $function$
  with centre as (
    select
      case
        when p_centre_lat is null or p_centre_lng is null or p_radius_miles is null
          then false
        when p_radius_miles <= 0 then false
        else true
      end as active
  ),
  filtered_properties as (
    select p.*, count(*) over() as total_count
    from public.properties p
    cross join centre c
    where p.is_active = true
      and p.department = p_department
      and (cardinality(p_statuses) = 0 or p.status = any(p_statuses))
      and (p_min_price is null or p.price >= p_min_price)
      and (p_max_price is null or p.price <= p_max_price)
      and (p_min_bedrooms is null or p.bedrooms >= p_min_bedrooms)
      and (p_max_bedrooms is null or p.bedrooms <= p_max_bedrooms)
      and (p_min_bathrooms is null or p.bathrooms >= p_min_bathrooms)
      and (cardinality(p_property_types) = 0 or p.search_property_type = any(p_property_types))
      and (cardinality(p_tenures) = 0 or p.search_tenure = any(p_tenures))
      and (cardinality(p_features) = 0 or p.search_features @> p_features)
      and (
        not c.active
        or (
          p.latitude is not null
          and p.longitude is not null
          and 7917.5226 * asin(sqrt(
              power(sin(radians(p.latitude - p_centre_lat) / 2), 2)
            + cos(radians(p_centre_lat)) * cos(radians(p.latitude))
              * power(sin(radians(p.longitude - p_centre_lng) / 2), 2)
          )) <= p_radius_miles
        )
      )
      and (
        c.active
        or p_location is null
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

revoke execute on function public.search_properties(
  text, text, numeric, numeric, integer, integer, integer,
  text[], text[], text[], text[], text, integer, integer,
  double precision, double precision, double precision
) from public;

grant execute on function public.search_properties(
  text, text, numeric, numeric, integer, integer, integer,
  text[], text[], text[], text[], text, integer, integer,
  double precision, double precision, double precision
) to anon, authenticated;

commit;
