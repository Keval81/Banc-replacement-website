import { toJsonLd } from "@/lib/json-ld";

interface JsonLdProps {
  data: unknown;
}

/** Server component rendering escaped JSON-LD structured data. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(data) }}
    />
  );
}

export default JsonLd;
