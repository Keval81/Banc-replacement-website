import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageBandProps {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  back?: { href: string; label: string };
  /** Photograph behind the band. The scrim keeps the text readable. */
  image?: { src: string; alt: string; priority?: boolean };
  /** Actions or a form that belongs to the opener. */
  children?: React.ReactNode;
  as?: "h1" | "h2";
}

/**
 * The dark opener every interior page starts with: sky eyebrow, light serif
 * title, short lede, all left-aligned. See DESIGN.md "Dark band".
 * Sits directly under the fixed header, which already supplies its own spacer.
 */
export function PageBand({ eyebrow, title, lede, back, image, children, as: Heading = "h1" }: PageBandProps) {
  return (
    <section className="banc-dark-surface relative overflow-hidden bg-banc-dark-deep text-white">
      {image && (
        <>
          <Image src={image.src} alt={image.alt} fill sizes="100vw" priority={image.priority} className="object-cover" />
          <div className="absolute inset-0 bg-banc-dark-deep/75" aria-hidden="true" />
        </>
      )}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        {back && (
          <Link
            href={back.href}
            className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banc-focus-dark)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--banc-focus-dark)]">{eyebrow}</p>
        <Heading
          className="mt-3 max-w-4xl font-display font-light leading-[1.05] tracking-[-0.02em] text-white"
          style={{ fontSize: "clamp(34px, 5vw, 64px)" }}
        >
          {title}
        </Heading>
        {lede && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">{lede}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
