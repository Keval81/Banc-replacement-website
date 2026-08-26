import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { MobileSocialPresentation } from "@/lib/landing-ui";

interface SocialIconLinkProps {
  href: string;
  label: string;
  iconSrc: string;
  imageLoading: "eager";
  presentation: MobileSocialPresentation;
}

export function SocialIconLink({
  href,
  label,
  iconSrc,
  imageLoading,
  presentation,
}: SocialIconLinkProps): React.ReactElement {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="cursor-pointer rounded-full border-0 bg-transparent p-0 shadow-none transition-transform duration-200 hover:scale-105 hover:bg-transparent focus-visible:ring-white/90 focus-visible:ring-offset-banc-dark-deep active:scale-95 motion-reduce:transition-none"
      style={{
        width: presentation.touchTargetSize,
        height: presentation.touchTargetSize,
        backgroundColor: presentation.surface,
      }}
    >
      <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
        <Image
          src={iconSrc}
          alt=""
          width={presentation.iconSize}
          height={presentation.iconSize}
          loading={imageLoading}
          className="drop-shadow-[0_3px_10px_rgba(0,0,0,0.28)]"
          style={{
            width: presentation.iconSize,
            height: presentation.iconSize,
          }}
          aria-hidden="true"
        />
      </a>
    </Button>
  );
}
