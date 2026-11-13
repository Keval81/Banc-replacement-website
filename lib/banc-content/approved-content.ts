import { areaGuides } from "../area-guides.ts";
import { BUYERS_GUIDE } from "./buyers-guide.ts";
import { CONTACT_PAGE } from "./contact.ts";
import { LANDLORDS_GUIDE } from "./landlords-guide.ts";
import { SELLERS_GUIDE } from "./sellers-guide.ts";
import { TENANTS_GUIDE } from "./tenants-guide.ts";
import type {
  ApprovedBancDocument,
  ApprovedBancPage,
} from "./types.ts";

const APPROVED_PAGES = [
  BUYERS_GUIDE,
  SELLERS_GUIDE,
  LANDLORDS_GUIDE,
  TENANTS_GUIDE,
  CONTACT_PAGE,
] as const satisfies readonly ApprovedBancPage[];

function pageId(page: ApprovedBancPage): string {
  return page.href.slice(1).replaceAll("/", ":");
}

function buildPageDocuments(
  page: ApprovedBancPage,
): ApprovedBancDocument[] {
  return page.sections.map((section) => ({
    id: `${pageId(page)}:${section.id}`,
    title: page.title,
    sectionTitle: section.title,
    href: page.href,
    text: section.body.join("\n\n"),
    aliases: section.aliases,
  }));
}

const AREA_GUIDE_DOCUMENTS: readonly ApprovedBancDocument[] = areaGuides.map(
  (guide) => ({
    id: `area-guide:${guide.slug}`,
    title: `${guide.name} area guide`,
    sectionTitle: guide.teaser,
    href: `/area-guides/${guide.slug}`,
    text: guide.paragraphs.join("\n\n"),
    aliases: [guide.name, guide.teaser, `${guide.name} neighbourhood`],
  }),
);

// "What areas do you cover?" had no answer: each guide covers one place and
// nothing listed them together. Built from the published guides, so it cannot
// name an area the site does not have a page for.
const AREAS_COVERED_DOCUMENT: ApprovedBancDocument = {
  id: "areas-covered",
  title: "Areas Banc covers",
  sectionTitle: "Areas we cover",
  href: "/area-guides",
  text: `Banc Property Group is an independent sales and lettings agency based in Cuffley, Hertfordshire. The areas Banc covers are ${
    areaGuides.map((guide) => guide.name).join(", ").replace(/, ([^,]*)$/, " and $1")
  }.`,
  aliases: ["areas covered", "areas we cover", "which areas", "where do you cover", "coverage area", "local areas"],
};

export const APPROVED_BANC_DOCUMENTS: readonly ApprovedBancDocument[] = [
  ...APPROVED_PAGES.flatMap(buildPageDocuments),
  AREAS_COVERED_DOCUMENT,
  ...AREA_GUIDE_DOCUMENTS,
];
