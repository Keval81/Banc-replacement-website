import {
  createPropertyChatHandler,
  parsePropertyChatRequest,
} from "@/lib/property-chat";
import { searchProperties } from "@/lib/property-search/server";

const handlePropertyChat = createPropertyChatHandler(searchProperties);

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const chatRequest = parsePropertyChatRequest(body);
  if (chatRequest === null) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  return Response.json(await handlePropertyChat(chatRequest));
}
