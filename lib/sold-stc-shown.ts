// Sold STC sales the Banc team still wants on the site. Expert Agent never
// clears Sold STC, so the status alone would republish the whole archive
// (238 rows on 15 Sep 2026); only references listed here stay visible, as
// under offer with a "Sold STC" label. Kept by hand until the Streets CRM
// migration, which replaces this list with an automatic expiry.
export const SOLD_STC_SHOWN_ON_SITE: ReadonlySet<string> = new Set<string>([
  "BPGC1868", // 20 Poppy Walk, Goffs Oak EN7 6TJ
  "BPGC1881", // 16 Edward Close, Goffs Oak EN7 5FD
  "BPGC1693", // 3 Edward Close, Goffs Oak EN7 5FD
  "BPGC1638", // 17 Tolmers Gardens, Cuffley EN6 4JE
  "BPGC1920", // 4 Bittern Close, Cheshunt EN7 6WF
  "BPGC1463", // 46 Plough Hill, Cuffley EN6 4DS
  "BPGC1641", // 6 Highfields, Cuffley EN6 4EL
  "BPGC1666", // 20 Colston Crescent, Goffs Oak EN7 5RS
  "BPGC1828", // 430 Goffs Lane, Goffs Oak EN7 5EN
  "BPGC1855", // 1 Huxley Close, Cheshunt EN7 6EH
  "BPGC1819", // 42 Cranfield Crescent, Cuffley EN6 4EA
  "BPGC1766", // 3 Burton Lane, Goffs Oak EN7 6SJ
]);
