// Metadata for /search lives in page.tsx (buildMetadata). This layout is a
// pass-through kept so the route segment structure is unchanged.
export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
