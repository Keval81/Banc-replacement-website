const EXPERT_AGENT_HOST = "expertagent.co.uk";

const MEDIA_TYPE_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/gif": "gif",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const SUPPORTED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp", "gif"]);

export function getSafeFloorplanDownloadUrl(value: string): URL | null {
  try {
    const trimmedValue = value.trim();
    if (hasExplicitNumericPort(trimmedValue)) return null;

    const url = new URL(trimmedValue);
    const hostname = url.hostname.toLowerCase();
    const isExpertAgentHost = hostname === EXPERT_AGENT_HOST || hostname.endsWith(`.${EXPERT_AGENT_HOST}`);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !isExpertAgentHost ||
      url.username ||
      url.password ||
      url.port
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function hasExplicitNumericPort(value: string): boolean {
  const authority = value.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#\\]*)/i)?.[1];
  if (!authority) return false;

  const host = authority.slice(authority.lastIndexOf("@") + 1);
  return /:\d+$/.test(host);
}

export function isAllowedFloorplanContentType(value: string | null): value is string {
  if (!value) return false;
  return Object.hasOwn(MEDIA_TYPE_EXTENSIONS, value.split(";", 1)[0].trim().toLowerCase());
}

export function getFloorplanDownloadFilename(url: URL, contentType: string): string {
  const contentTypeKey = contentType.split(";", 1)[0].trim().toLowerCase();
  const fallbackExtension = MEDIA_TYPE_EXTENSIONS[contentTypeKey];
  const decodedFilename = decodeURIComponent(url.pathname.split("/").pop() ?? "");
  const sourceExtension = decodedFilename.split(".").pop()?.toLowerCase();
  const extension = sourceExtension && SUPPORTED_EXTENSIONS.has(sourceExtension) ? sourceExtension : fallbackExtension;
  const sourceBasename = sourceExtension ? decodedFilename.slice(0, -(sourceExtension.length + 1)) : decodedFilename;
  const basename = sourceBasename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${basename || "floorplan"}.${extension ?? "pdf"}`;
}
