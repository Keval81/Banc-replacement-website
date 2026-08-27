const REDACTED = "[redacted]";

export interface FtpCurlInvocation {
  args: ["-s", "--config", "-"];
  input: string;
}

export function createFtpCurlInvocation(
  url: string,
  username: string,
  password: string,
): FtpCurlInvocation {
  return {
    args: ["-s", "--config", "-"],
    input: `url = ${quoteCurlConfigValue(url)}\nuser = ${quoteCurlConfigValue(`${username}:${password}`)}\n`,
  };
}

export function sanitizeSyncError(error: unknown, secrets: string[]): string {
  const message = error instanceof Error ? error.message : String(error);
  return secrets
    .filter((secret) => secret !== "")
    .sort((left, right) => right.length - left.length)
    .reduce((safeMessage, secret) => safeMessage.replaceAll(secret, REDACTED), message);
}

function quoteCurlConfigValue(value: string): string {
  return `"${value
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")}"`;
}
