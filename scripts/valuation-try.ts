/**
 * Try the instant valuation on one home without touching the website form (which emails Banc).
 *
 *   node --env-file=.env.local scripts/valuation-try.ts "EN7 6SB" 10 detached
 *
 * Type is detached | semi | terraced | flat. For a flat, add the flat as a 4th argument: "FLAT 2".
 * With no house number it lists the addresses on record at that postcode.
 */
import { addressesFromHistory, describeBasis, liveDeps, runInstantValuation, type InstantEstimate } from "../lib/valuation/instant.ts";
import { fetchPostcodeHistory } from "../lib/valuation/register.ts";

const [postcode, paon, type = "", saon = ""] = process.argv.slice(2);
if (!postcode) {
  console.error('Usage: node --env-file=.env.local scripts/valuation-try.ts "EN7 6SB" 10 detached ["FLAT 2"]');
  process.exit(1);
}
const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;

if (!paon) {
  const addresses = addressesFromHistory(await fetchPostcodeHistory(postcode));
  console.log(addresses.length ? addresses.map((a) => `  ${a.label}`).join("\n") : "No sales on record at that postcode.");
  process.exit(0);
}

const show = (label: string, e: InstantEstimate | null) => {
  if (!e) return console.log(`${label}: no estimate`);
  const width = Math.round((100 * (e.high - e.low)) / e.figure);
  console.log(`${label}: ${gbp(e.figure)}   range ${gbp(e.low)} – ${gbp(e.high)} (${width}% wide)   ${e.confidence} confidence`);
};
const input = { postcode, paon: paon.toUpperCase(), saon: saon.toUpperCase(), propertyType: type, majorWork: false };
const today = await runInstantValuation(input, { ...liveDeps, compAreas: undefined, homeArea: undefined });
await new Promise((resolve) => setTimeout(resolve, 1200));
const next = await runInstantValuation(input);

console.log(`\n${[saon, paon, postcode].filter(Boolean).join(" ")}${type ? ` (${type})` : ""}`);
show("Live today ", today);
show("New version", next);
if (next) {
  console.log(`\n${describeBasis(next)}`);
  if (!next.usedFloorArea) console.log("No floor area found for this home, so the new version matches today's.");
  if (next.homeLastSale) console.log(`Own last sale: ${gbp(next.homeLastSale.price)} on ${next.homeLastSale.date}${next.homeLastSale.used ? "" : " (too old to use)"}`);
  console.log("Closest sales used:");
  for (const c of next.comparables) console.log(`  ${c.address}, ${c.postcode}  ${c.date}  ${gbp(c.price)}  (today ≈ ${gbp(c.indexed)})`);
}
