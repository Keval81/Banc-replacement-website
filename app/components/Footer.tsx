import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2C2F33] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/banc-logo.png"
              alt="Banc Property Group"
              width={210}
              height={60}
              className="h-[60px] w-auto object-contain brightness-0 invert"
            />
            <p className="mt-4 text-sm text-white/70">
              Exceptional properties and bespoke service across Cuffley, Mayfair, and beyond.
            </p>
            <div className="mt-6 flex items-center gap-4 text-white/70">
              <Link href="#" className="transition-colors hover:text-[#4BC5C5]" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-[#4BC5C5]" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="transition-colors hover:text-[#4BC5C5]" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 font-heading">Quick Links</p>
            <ul className="mt-4 space-y-3 text-sm">
              {["Sales", "Lettings", "Premier Homes", "About", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="transition-colors hover:text-[#4BC5C5]">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 font-heading">Services</p>
            <ul className="mt-4 space-y-3 text-sm">
              {["Valuations", "Property Management", "Vendor Portal", "Market Intelligence"].map((item) => (
                <li key={item}>
                  <Link href="#" className="transition-colors hover:text-[#4BC5C5]">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 font-heading">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>020 1234 5678</li>
              <li>hello@bancproperty.co.uk</li>
              <li>14 Mayfair Place, London W1</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50 font-heading">
          © 2026 Banc Property Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
