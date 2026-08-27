import { parsePropertySearchParams } from "./query.ts";
import type {
  PropertyDepartment,
  PropertySearch,
  PropertySearchQuery,
} from "./types.ts";

const INVALID_DEPARTMENT_RESPONSE = {
  error: "Choose whether you are buying or renting.",
};
const INVALID_FILTERS_RESPONSE = {
  error: "Some search filters are invalid.",
};
const UNAVAILABLE_RESPONSE = {
  error: "Live listings are temporarily unavailable. Please try again shortly.",
};

function parseDepartment(url: URL): PropertyDepartment | null {
  const departments = url.searchParams.getAll("department");
  if (departments.length !== 1) return null;
  return departments[0] === "sales" || departments[0] === "lettings"
    ? departments[0]
    : null;
}

export async function handlePropertySearchRequest(
  request: Request,
  search: PropertySearch,
): Promise<Response> {
  const url = new URL(request.url);
  const department = parseDepartment(url);
  if (department === null) {
    return Response.json(INVALID_DEPARTMENT_RESPONSE, { status: 400 });
  }

  let query: PropertySearchQuery;
  try {
    query = parsePropertySearchParams(url.searchParams, department);
  } catch {
    return Response.json(INVALID_FILTERS_RESPONSE, { status: 400 });
  }

  try {
    return Response.json(await search(query), { status: 200 });
  } catch {
    return Response.json(UNAVAILABLE_RESPONSE, { status: 503 });
  }
}
