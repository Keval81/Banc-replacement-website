import assert from "node:assert/strict";
import test from "node:test";

import { toJsonLd } from "../json-ld.ts";

test("escapes characters that could break out of a script element", () => {
  const html = toJsonLd({ name: "Banc </script><img src=x onerror=alert(1)> & Co" });

  assert.equal(html.includes("<"), false);
  assert.equal(html.includes(">"), false);
  assert.equal(html.includes("&"), false);
  assert.equal(
    html,
    '{"name":"Banc \\u003c/script\\u003e\\u003cimg src=x onerror=alert(1)\\u003e \\u0026 Co"}',
  );
});

test("remains valid JSON that round-trips to the original value", () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    description: "Sales & lettings <b>in</b> Cuffley",
    nested: { list: [1, "two", null, true], amp: "a&b" },
  };

  assert.deepEqual(JSON.parse(toJsonLd(data)), data);
});
