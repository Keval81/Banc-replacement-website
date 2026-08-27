import { handlePropertySearchRequest } from "@/lib/property-search/http";
import { searchProperties } from "@/lib/property-search/server";

export async function GET(request: Request): Promise<Response> {
  const response = await handlePropertySearchRequest(request, searchProperties);
  response.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return response;
}
