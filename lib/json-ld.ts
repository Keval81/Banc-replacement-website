/**
 * Serialises structured data for a `<script type="application/ld+json">`.
 *
 * JSON.stringify alone is unsafe inside a script element: a string value
 * containing `</script>` would terminate the block. Escaping `<`, `>` and `&`
 * as JSON unicode escapes keeps the payload valid JSON and inert as HTML.
 */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
