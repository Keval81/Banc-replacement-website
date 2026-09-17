// Vercel Cron -> GitHub workflow_dispatch -> the real FTP sync.
//
// The sync itself stays in GitHub Actions: scripts/sync-expert-agent.ts shells
// out to curl (FTP) and unzip, neither of which exists in a serverless runtime.
// Only the *trigger* moves here, because GitHub's scheduler drops most slots
// and Vercel Pro crons do not.

const REPO = "Keval81/Banc-replacement-website";
const REF = "main";

export const SYNC_WORKFLOW_FILE = "sync-expert-agent.yml";

export type DispatchResult =
  | { ok: true; status: number }
  | { ok: false; status: number; error: string };

type DispatchOptions = {
  token: string;
  fetchImpl?: typeof fetch;
};

export async function dispatchPropertySync({
  token,
  fetchImpl = fetch,
}: DispatchOptions): Promise<DispatchResult> {
  if (!token) {
    return {
      ok: false,
      status: 0,
      error:
        "GITHUB_DISPATCH_TOKEN is not set, so the property sync cannot be triggered.",
    };
  }

  const url = `https://api.github.com/repos/${REPO}/actions/workflows/${SYNC_WORKFLOW_FILE}/dispatches`;

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "content-type": "application/json",
      },
      body: JSON.stringify({ ref: REF }),
    });
  } catch (cause) {
    return {
      ok: false,
      status: 0,
      error: `Could not reach the GitHub dispatch API: ${redact(String(cause), token)}`,
    };
  }

  if (!response.ok) {
    // GitHub echoes the token back in some error bodies; never let it out.
    const body = redact(await response.text().catch(() => ""), token);
    return {
      ok: false,
      status: response.status,
      error: `GitHub refused the sync dispatch with ${response.status}: ${body.slice(0, 300)}`,
    };
  }

  return { ok: true, status: response.status };
}

function redact(text: string, token: string): string {
  return token ? text.split(token).join("[redacted]") : text;
}
