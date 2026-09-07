import { emailTemplates } from "./email.ts";
import type { EnquiryMail } from "./enquiry-delivery.ts";

export interface NewsletterSignup {
  email: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  preferences?: {
    newProperties?: boolean;
    marketUpdates?: boolean;
    blogPosts?: boolean;
    priceDrops?: boolean;
  };
}

const gbp = (value: number) => `£${Math.round(value).toLocaleString("en-GB")}`;

/**
 * A newsletter sign-up is an enquiry like any other until there is a list to
 * put it on: it lands in the office inbox as an email, the same path the
 * homepage alerts block takes. Before this the route kept the address in a
 * serverless process and told the visitor "subscribed" (found 7 Sep).
 */
export function buildNewsletterEnquiry(signup: NewsletterSignup, inbox: string): EnquiryMail {
  const name = [signup.firstName, signup.lastName].filter(Boolean).join(" ").trim() || "Newsletter subscriber";
  const wants = Object.entries(signup.preferences ?? {})
    .filter(([, on]) => on)
    .map(([key]) => ({ newProperties: "new properties", marketUpdates: "market updates", blogPosts: "blog posts", priceDrops: "price drops" }[key] ?? key));
  const lines = [
    `${name} signed up for the newsletter from the website.`,
    "",
    `Email: ${signup.email}`,
    signup.location ? `Area of interest: ${signup.location}` : "",
    signup.minPrice !== undefined || signup.maxPrice !== undefined
      ? `Budget: ${signup.minPrice !== undefined ? gbp(signup.minPrice) : "no minimum"} – ${signup.maxPrice !== undefined ? gbp(signup.maxPrice) : "no maximum"}`
      : "",
    signup.bedrooms !== undefined ? `Bedrooms: ${signup.bedrooms}+` : "",
    wants.length ? `Wants: ${wants.join(", ")}` : "",
  ].filter((line, i, all) => line !== "" || (i > 0 && all[i - 1] !== ""));
  const subject = "Newsletter sign-up";
  const message = lines.join("\n");
  return {
    team: {
      to: inbox,
      replyTo: signup.email,
      ...emailTemplates.contactNotification({ name, email: signup.email, subject, message }),
    },
    customer: {
      to: signup.email,
      replyTo: inbox,
      ...emailTemplates.contactConfirmation({ name, subject, message: "You'll hear from us when there's something worth reading — new homes, the local market, and the magazine." }),
    },
  };
}
