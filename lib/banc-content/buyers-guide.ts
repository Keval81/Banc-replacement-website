import type { ApprovedBancPage } from "./types.ts";

export const BUYERS_GUIDE = {
  title: "Buyers Guide",
  href: "/sales/buyers-guide",
  sections: [
    {
      id: "website",
      title: "Our Website",
      body: [
        "The first port of call is the Banc website, where every property is detailed with exceptional photos and floor plans, location and amenity maps. We make it our business and our pleasure to know the areas and properties intimately so we can extend our knowledge to you.",
        "Speak with your financial adviser to determine an appropriate budget before starting your search. Having a mortgage 'agreement in principle' at this point is advantageous when you do actually make an offer. Speak with us and we can point you in the right direction.",
      ],
      aliases: ["buying guide", "property search", "mortgage agreement in principle"],
    },
    {
      id: "talk",
      title: "Let's Talk",
      body: [
        "Give us a call or pop into our prominently positioned office on the high street for a coffee and a chat. We will be able to answer all of your questions about property types and styles in the area, buying costs and we can recommend local financial and conveyancing services, and more importantly arrange viewings for you. We can also discuss our 'discrete marketed' properties which are not available online, but exclusively to our registered clients.",
        "Make sure you are aware of all relevant costs such as mortgage fees, survey fees, conveyancing, stamp duty charges and removals. Let us know if you need a refresher on any of them.",
      ],
      aliases: ["buying costs", "discreet properties", "arrange viewings"],
    },
    {
      id: "viewings",
      title: "Arranging Views",
      body: [
        "Once you have identified some potential properties, we will take you to view them. We do offer a pickup service from the station if you are popping out to view after work. Let us guide you round the beautiful houses and local area.",
        "It's easy to let your heart rule your head so be prepared with a checklist and questions before you visit the properties.",
      ],
      aliases: ["arrange a viewing", "property viewing", "station pickup"],
    },
    {
      id: "offer",
      title: "Make An Offer",
      body: [
        "Seen a property you like? Make an offer! All offers from qualified buyers will be presented to the seller without delay. We do our very best to get a price that satisfies both you and the vendor.",
        "It can be hard when deciding how much to offer, but always make sure the offer you are making is viable, and that you are able to support it.",
      ],
      aliases: ["make an offer", "buying offer", "qualified buyer"],
    },
    {
      id: "offer-agreed",
      title: "Offer Agreed",
      body: [
        "Congratulations! It's almost time to bring out the champagne, but not quite yet. Communication is the key to a successful purchase. We stay in touch with you, the sellers, solicitors, surveyors and mortgage advisers to ensure your purchase proceeds as quickly as possible. Don't worry – we are there the whole way through to guide you and assist in all aspects of the process.",
        "When an offer is agreed you will need to instruct your solicitor and mortgage lender in order to progress your case.",
      ],
      aliases: ["accepted offer", "purchase progression", "instruct solicitor"],
    },
    {
      id: "exchange",
      title: "Exchange",
      body: [
        "This is when signed contracts are exchanged between your solicitor and the seller's solicitor. This is also the point when your deposit, normally 10%, is transferred to the seller's solicitor and a moving day is set. At this point, the transaction becomes legally binding.",
        "Make sure you take this time to confirm removals, redirect post, call the cable man and organise utilities.",
      ],
      aliases: ["exchange contracts", "buyer deposit", "legally binding"],
    },
    {
      id: "completion",
      title: "Completion",
      body: [
        "Now the bubbly can be taken off ice and enjoyed on moving day in your new home. To make it easier for you, we aim to be there at your new home with the keys instead of you having to detour to our office to collect them.",
        "Look out for our moving in surprise soon after completion.",
      ],
      aliases: ["moving day", "collect keys", "purchase completion"],
    },
  ],
} as const satisfies ApprovedBancPage;
