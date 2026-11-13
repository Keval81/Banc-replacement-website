import { LOCAL_SCHOOLS_DATA, type LocalSchoolRecord } from "./local-schools-data.ts";

export interface NearbySchool {
  name: string;
  phase: LocalSchoolRecord["phase"];
  distanceMiles: number;
}

const EARTH_RADIUS_MILES = 3958.8;
const MAX_DISTANCE_MILES = 5;
const NEAREST_PRIMARIES = 3;
const NEAREST_SECONDARIES = 2;

function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radians = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * radians) / 2) ** 2 +
    Math.cos(lat1 * radians) * Math.cos(lat2 * radians) *
      Math.sin(((lng2 - lng1) * radians) / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

/**
 * The nearest state-funded primaries, then secondaries (all-through schools
 * count as secondary), by straight-line distance. Empty when the point is
 * outside the area the register copy covers, so the bot says nothing rather
 * than naming a school miles away.
 */
export function nearestSchools(lat: number, lng: number): NearbySchool[] {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

  const ranked = LOCAL_SCHOOLS_DATA.schools
    .map((school) => ({
      name: school.name,
      phase: school.phase,
      distanceMiles: Math.round(milesBetween(lat, lng, school.lat, school.lng) * 10) / 10,
    }))
    .filter((school) => school.distanceMiles <= MAX_DISTANCE_MILES)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  return [
    ...ranked.filter((school) => school.phase === "primary").slice(0, NEAREST_PRIMARIES),
    ...ranked.filter((school) => school.phase !== "primary").slice(0, NEAREST_SECONDARIES),
  ];
}

export function describeSchool(school: NearbySchool): string {
  return `${school.name} (${school.phase}, ${school.distanceMiles.toFixed(1)} miles)`;
}

export function describeNearestSchools(lat: number, lng: number): string[] {
  return nearestSchools(lat, lng).map(describeSchool);
}

export const LOCAL_SCHOOL_AREAS = LOCAL_SCHOOLS_DATA.areas;
