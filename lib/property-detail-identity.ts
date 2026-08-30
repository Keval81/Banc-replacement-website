export type PropertyDetailIdentityColumn = "expert_agent_id" | "id";

export interface PropertyDetailLookupResult<TData, TError> {
  data: TData | null;
  error: TError | null;
}

type PropertyDetailLookup<TData, TError> = (
  column: PropertyDetailIdentityColumn,
  id: string,
) => Promise<PropertyDetailLookupResult<TData, TError>>;

export async function findPropertyDetailRow<TData, TError>(
  id: string,
  lookup: PropertyDetailLookup<TData, TError>,
): Promise<PropertyDetailLookupResult<TData, TError>> {
  const primary = await lookup("expert_agent_id", id);
  if (primary.error !== null || primary.data !== null) return primary;

  return lookup("id", id);
}
