import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";

// Server component that renders a blog post body from MDX source.
// Tailwind typography is not installed, so each element gets explicit
// styles using the site's banc-* tokens.

type Components = NonNullable<MDXRemoteProps["components"]>;

function Anchor({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const className =
    "font-medium text-banc-focus underline decoration-banc-sky/60 underline-offset-4 transition-colors hover:text-banc-sky-dark hover:decoration-banc-sky-dark";
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents: Components = {
  // The article <h1> is rendered by the page from frontmatter; any heading
  // level 1 left in the body is demoted so each page keeps a single h1.
  h1: (props) => (
    <h2 className="mt-10 mb-4 font-heading text-2xl font-semibold text-banc-dark lg:text-3xl" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-10 mb-4 font-heading text-2xl font-semibold text-banc-dark lg:text-3xl" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 mb-3 font-heading text-xl font-semibold text-banc-dark" {...props} />
  ),
  h4: (props) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold text-banc-dark" {...props} />
  ),
  p: (props) => <p className="mb-5 text-[17px] leading-relaxed text-banc-dark-mid" {...props} />,
  ul: (props) => (
    <ul className="mb-6 list-disc space-y-2 pl-6 text-[17px] leading-relaxed text-banc-dark-mid marker:text-banc-sky" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-6 list-decimal space-y-2 pl-6 text-[17px] leading-relaxed text-banc-dark-mid marker:font-semibold marker:text-banc-sky-dark" {...props} />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  a: Anchor,
  strong: (props) => <strong className="font-semibold text-banc-dark" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-8 border-l-4 border-banc-sky bg-banc-grey-pale px-6 py-4 text-lg italic text-banc-dark"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-banc-grey/30" />,
  img: ({ alt = "", src, ...rest }: ComponentPropsWithoutRef<"img">) => (
    // Author-supplied images can be any size/host, so a plain <img> is used
    // rather than next/image to avoid remotePatterns failures at render time.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt}
      loading="lazy"
      className="my-8 h-auto w-full rounded-2xl"
      {...rest}
    />
  ),
  table: (props) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border-b border-banc-grey/40 bg-banc-grey-pale px-3 py-2 font-semibold text-banc-dark" {...props} />
  ),
  td: (props) => <td className="border-b border-banc-grey/20 px-3 py-2 text-banc-dark-mid" {...props} />,
  code: (props) => (
    <code className="rounded bg-banc-grey-pale px-1.5 py-0.5 font-mono text-[0.9em] text-banc-dark" {...props} />
  ),
  pre: (props) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-banc-dark-deep p-4 text-sm text-white" {...props} />
  ),
};

// Drops a leading "# Title" line so the page's own <h1> is the only one.
export function stripLeadingH1(source: string): string {
  return source.replace(/^\s*#\s+[^\n]+\n+/, "");
}

export function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={stripLeadingH1(source)} components={mdxComponents} />;
}

export default MdxContent;
