import {
  applyPropertySearchCachePolicy,
  handlePropertySearchRequest,
} from "@/lib/property-search/http";
import { searchProperties } from "@/lib/property-search/server";

export async function GET(request: Request): Promise<Response> {
  const response = await handlePropertySearchRequest(request, searchProperties);
  return applyPropertySearchCachePolicy(response);
}
