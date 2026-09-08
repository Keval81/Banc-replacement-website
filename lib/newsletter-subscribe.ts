export interface SubscribeResult {
  ok: boolean;
  message: string;
}

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

const RETRY_MESSAGE =
  "We could not save your sign-up just now. Please try again, or email the office and we will add you.";

// The footer box used to fake this with a timer. It now posts to the same
// route as /newsletter/signup, so the sign-up reaches the office inbox.
export async function subscribeToNewsletter(
  email: string,
  fetcher: Fetcher = (url, init) => fetch(url, init),
): Promise<SubscribeResult> {
  try {
    const response = await fetcher("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (response.ok || response.status === 409) {
      return { ok: true, message: "Thanks — you're on the list." };
    }
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    return { ok: false, message: body.error || RETRY_MESSAGE };
  } catch {
    return { ok: false, message: RETRY_MESSAGE };
  }
}
