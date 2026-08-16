"use client";

import { useCookies } from "@/hooks/useCookies";
import { getSafeExternalUrl } from "@/lib/property-detail-view";
import { buildPropertyLeadActions, type LivePropertyDetail } from "@/lib/property-view";

interface PropertyContactActionsProps {
  property: LivePropertyDetail;
}

export function PropertyContactPanel({ property }: PropertyContactActionsProps): React.ReactElement {
  const actions = buildPropertyLeadActions(property.department, property.id);
  const brochureUrl = getSafeExternalUrl(property.brochureUrl);
  const tourUrl = getSafeExternalUrl(property.virtualTourUrl);

  return (
    <aside className="hidden lg:block" aria-label="Property enquiry">
      <div className="sticky top-24 rounded-3xl border border-banc-grey/20 bg-banc-grey-pale p-6 shadow-[0_24px_60px_-36px_rgba(16,34,56,0.35)]">
        <p className="font-serif text-2xl text-banc-dark">Arrange your viewing</p>
        <p className="mt-2 text-sm leading-6 text-banc-grey">
          Speak with Banc&apos;s local team about this home.
        </p>
        <a
          href={actions.primaryHref}
          className="mt-6 flex h-12 items-center justify-center rounded-full bg-banc-sky px-5 font-medium text-white"
        >
          {actions.primaryLabel}
        </a>
        <a
          href={actions.secondaryHref}
          className="mt-3 flex h-12 items-center justify-center rounded-full border border-banc-dark/20 px-5 font-medium text-banc-dark"
        >
          {actions.secondaryLabel}
        </a>
        {(brochureUrl || tourUrl) && (
          <div className="mt-6 space-y-3 border-t border-banc-grey/20 pt-5">
            {brochureUrl && (
              <a
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium text-banc-dark hover:text-banc-sky"
              >
                Full brochure
              </a>
            )}
            {tourUrl && (
              <a
                href={tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium text-banc-dark hover:text-banc-sky"
              >
                Virtual tour
              </a>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export function PropertyMobileActions({ property }: PropertyContactActionsProps): React.ReactElement | null {
  const { hasConsented } = useCookies();
  const actions = buildPropertyLeadActions(property.department, property.id);

  if (!hasConsented) return null;

  return (
    <aside
      className="safe-area-pb fixed inset-x-0 bottom-0 z-40 border-t border-banc-grey/20 bg-white lg:hidden"
      aria-label="Property enquiry actions"
    >
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 px-4 py-3">
        <a
          href={actions.primaryHref}
          className="flex h-12 items-center justify-center rounded-full bg-banc-sky px-4 text-center text-sm font-medium text-white"
        >
          {actions.primaryLabel}
        </a>
        <a
          href={actions.secondaryHref}
          className="flex h-12 items-center justify-center rounded-full border border-banc-dark/20 px-4 text-center text-sm font-medium text-banc-dark"
        >
          {actions.secondaryLabel}
        </a>
      </div>
    </aside>
  );
}
