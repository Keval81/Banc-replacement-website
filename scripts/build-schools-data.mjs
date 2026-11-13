#!/usr/bin/env node
// Builds lib/local-schools-data.ts from the Department for Education's
// "Get Information about Schools" register (a free daily CSV).
//
//   curl -L -o /tmp/gias.csv \
//     "https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/edubasealldata$(date +%Y%m%d).csv"
//   node scripts/build-schools-data.mjs /tmp/gias.csv
//
// Only open, state-funded primary, secondary and all-through schools inside
// Banc's patch are kept. Coordinates come from each school's postcode.
import fs from "node:fs";

const [, , csvPath] = process.argv;
if (!csvPath) {
  console.error("Usage: node scripts/build-schools-data.mjs <edubasealldata.csv>");
  process.exit(1);
}

// Easting/northing box around the listings Banc carries, with a margin.
const BOX = { minE: 512000, maxE: 548000, minN: 188000, maxN: 243000 };
const PHASES = new Map([
  ["Primary", "primary"],
  ["Middle deemed primary", "primary"],
  ["Secondary", "secondary"],
  ["Middle deemed secondary", "secondary"],
  ["All-through", "all-through"],
]);
const STATE_FUNDED_GROUPS = new Set([
  "Local authority maintained schools",
  "Academies",
  "Free Schools",
]);
// [area guide name, name the place gazetteer uses]
const AREA_CENTRES = [
  ["Cuffley", "Cuffley"], ["Potters Bar", "Potters Bar"], ["Cheshunt", "Cheshunt"],
  ["Northaw", "Northaw"], ["Brookmans Park", "Brookmans Park"], ["Goffs Oak", "Goff's Oak"],
  ["Newgate Street Village", "Newgate Street"], ["Enfield", "Enfield"], ["Essendon", "Essendon"],
];

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell);
  return cells;
}

const lines = fs.readFileSync(csvPath, "latin1").split(/\r?\n/).filter(Boolean);
const header = parseCsvLine(lines[0]);
const col = (name) => {
  const index = header.indexOf(name);
  if (index === -1) throw new Error(`Register is missing the "${name}" column`);
  return index;
};
const C = {
  name: col("EstablishmentName"),
  status: col("EstablishmentStatus (name)"),
  group: col("EstablishmentTypeGroup (name)"),
  phase: col("PhaseOfEducation (name)"),
  low: col("StatutoryLowAge"),
  high: col("StatutoryHighAge"),
  town: col("Town"),
  postcode: col("Postcode"),
  easting: col("Easting"),
  northing: col("Northing"),
  urn: col("URN"),
};

const candidates = [];
for (const line of lines.slice(1)) {
  const row = parseCsvLine(line);
  const phase = PHASES.get(row[C.phase]);
  const easting = Number(row[C.easting]);
  const northing = Number(row[C.northing]);
  if (
    phase === undefined ||
    !row[C.status].startsWith("Open") ||
    !STATE_FUNDED_GROUPS.has(row[C.group]) ||
    !row[C.postcode] ||
    !(easting >= BOX.minE && easting <= BOX.maxE && northing >= BOX.minN && northing <= BOX.maxN)
  ) continue;
  candidates.push({
    urn: row[C.urn],
    name: row[C.name].replace(/\s+/g, " ").trim(),
    phase,
    ages: `${row[C.low]}-${row[C.high]}`,
    town: row[C.town].trim(),
    postcode: row[C.postcode].trim(),
  });
}

async function postcodesIo(path, body) {
  const response = await fetch(`https://api.postcodes.io${path}`, body === undefined ? undefined : {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`postcodes.io ${path} returned ${response.status}`);
  return (await response.json()).result;
}

const coordinates = new Map();
const postcodes = [...new Set(candidates.map((school) => school.postcode))];
for (let i = 0; i < postcodes.length; i += 100) {
  const results = await postcodesIo("/postcodes", { postcodes: postcodes.slice(i, i + 100) });
  for (const { query, result } of results) {
    if (result) coordinates.set(query, [result.latitude, result.longitude]);
  }
}

const schools = candidates
  .filter((school) => coordinates.has(school.postcode))
  .map((school) => {
    const [lat, lng] = coordinates.get(school.postcode);
    return { name: school.name, phase: school.phase, lat, lng };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const areas = [];
for (const [name, gazetteerName] of AREA_CENTRES) {
  const places = await postcodesIo(`/places?q=${encodeURIComponent(gazetteerName)}&limit=20`);
  const place = places.find((candidate) =>
    candidate.name_1 === gazetteerName &&
    candidate.eastings >= BOX.minE && candidate.eastings <= BOX.maxE &&
    candidate.northings >= BOX.minN && candidate.northings <= BOX.maxN
  );
  if (!place) throw new Error(`Could not locate ${name} inside Banc's patch`);
  areas.push({ name, lat: place.latitude, lng: place.longitude });
}

const data = {
  source: "Department for Education, Get Information about Schools",
  builtFrom: csvPath.match(/(\d{8})/)?.[1] ?? "unknown",
  areas,
  schools,
};
const out = new URL("../lib/local-schools-data.ts", import.meta.url);
fs.writeFileSync(out, `// Generated by scripts/build-schools-data.mjs. Do not edit by hand.
export interface LocalSchoolRecord {
  name: string;
  phase: "primary" | "secondary" | "all-through";
  lat: number;
  lng: number;
}

export const LOCAL_SCHOOLS_DATA: {
  source: string;
  builtFrom: string;
  areas: Array<{ name: string; lat: number; lng: number }>;
  schools: LocalSchoolRecord[];
} = ${JSON.stringify(data, null, 1)};
`);
console.log(`${schools.length} schools, ${areas.length} area centres written`);
