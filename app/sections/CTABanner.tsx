"use client";

import { Button } from "@/components/ui/button";

export default function CTABanner() {
  return (
    <section className="bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#0D9488]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-16 text-center text-white lg:flex-row lg:text-left lg:px-10">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Ready to find your perfect property?
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Speak with our team today to arrange a tailored valuation or viewing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" className="bg-white text-[#0D9488] hover:bg-white/90">
            Get a Valuation
          </Button>
          <Button variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10">
            Browse Properties
          </Button>
        </div>
      </div>
    </section>
  );
}
