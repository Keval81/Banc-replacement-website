export interface ApprovedBancSection {
  id: string;
  title: string;
  body: readonly string[];
  aliases: readonly string[];
}

export interface ApprovedBancPage {
  title: string;
  href: `/${string}`;
  sections: readonly ApprovedBancSection[];
}

export interface ApprovedBancDocument {
  id: string;
  title: string;
  sectionTitle: string;
  href: `/${string}`;
  text: string;
  aliases: readonly string[];
}
