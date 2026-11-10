/**
 * Floor areas from the government's energy certificate register, for the
 * valuation engine. Relative imports only, so the back-test can run it outside Next.
 *
 * Licence: the register's address fields may only be used to find a home's
 * certificate here; never store or display them. Floor area and the other
 * non-address fields are Open Government Licence.
 */

const API_URL = "https://api.get-energy-performance-data.communities.gov.uk";
const TIMEOUT_MS = 15_000;
const MIN_PLAUSIBLE_M2 = 15;
const MAX_PLAUSIBLE_M2 = 1500;

type Fetch = typeof fetch;

export type CertificateRow = {
  certificateNumber: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressLine4: string | null;
  registrationDate: string;
};

const tokens = (text: string) => text.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().split(" ").filter(Boolean);
const isNumber = (token: string) => /^\d+[A-Z]?$/.test(token);
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((t) => b.includes(t));

/**
 * The newest certificate for one home among a postcode's certificates. A home is
 * matched on every word of its number or name, and its house and flat numbers must
 * be exactly the certificate's — so "9" never matches "19", nor a house its flats.
 */
export function matchCertificate(home: { paon: string; saon: string }, rows: CertificateRow[]): CertificateRow | null {
  const wanted = [...new Set([...tokens(home.saon), ...tokens(home.paon)])];
  if (wanted.length === 0) return null;
  const wantedNumbers = wanted.filter(isNumber);
  const matches = rows.filter((row) => {
    const address = [...new Set(tokens([row.addressLine1, row.addressLine2, row.addressLine3, row.addressLine4].filter(Boolean).join(" ")))];
    return wanted.every((t) => address.includes(t)) && sameSet(wantedNumbers, address.filter(isNumber));
  });
  return matches.sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))[0] ?? null;
}

export function parseFloorArea(certificate: Record<string, unknown>): number | null {
  const area = Number(certificate.total_floor_area);
  return Number.isFinite(area) && area >= MIN_PLAUSIBLE_M2 && area <= MAX_PLAUSIBLE_M2 ? area : null;
}

async function get(path: string, token: string, fetcher: Fetch): Promise<unknown | null> {
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetcher(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      // The register occasionally stalls on one request (seen 10 Nov 2026); one more try usually lands.
      if (attempt < 1) continue;
      throw error;
    }
    if (response.status === 404) return null;
    if (response.status === 429 && attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, 5000 * (attempt + 1)));
      continue;
    }
    if (!response.ok) throw new Error(`Energy certificate register ${path.split("?")[0]} failed: HTTP ${response.status}`);
    return response.json();
  }
}

/** Every domestic certificate registered in one full postcode. */
export async function fetchPostcodeCertificates(postcode: string, token: string, fetcher: Fetch = fetch): Promise<CertificateRow[]> {
  const body = (await get(`/api/domestic/search?postcode=${encodeURIComponent(postcode.trim())}`, token, fetcher)) as { data?: CertificateRow[] } | null;
  return body?.data ?? [];
}

/** One certificate's total floor area in m², or null when it has none worth trusting. */
export async function fetchFloorArea(certificateNumber: string, token: string, fetcher: Fetch = fetch): Promise<number | null> {
  const body = (await get(`/api/certificate?certificate_number=${encodeURIComponent(certificateNumber)}`, token, fetcher)) as { data?: Record<string, unknown> } | null;
  return body?.data ? parseFloorArea(body.data) : null;
}
