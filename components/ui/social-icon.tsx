import Image from "next/image";

import { Button } from "@/components/ui/button";

interface SocialIconLinkProps {
  href: string;
  label: string;
  iconSrc: string;
  imageLoading: "eager";
}

export function SocialIconLink({
  href,
  label,
  iconSrc,
  imageLoading,
}: SocialIconLinkProps): React.ReactElement {
  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="h-11 w-11 cursor-pointer rounded-lg border-white/35 bg-white/95 p-0 shadow-[0_6px_18px_rgba(0,0,0,0.24)] transition-[filter,box-shadow,border-color] duration-200 hover:border-white hover:bg-white hover:brightness-105 hover:shadow-[0_8px_22px_rgba(0,0,0,0.3)] focus-visible:ring-white focus-visible:ring-offset-banc-dark-deep"
    >
      <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
        <Image
          src={iconSrc}
          alt=""
          width={20}
          height={20}
          loading={imageLoading}
          className="h-5 w-5"
          aria-hidden="true"
        />
      </a>
    </Button>
  );
}
