/**
 * The real Google reviews Banc has received, in one place.
 *
 * They were inlined in app/reviews/page.tsx, which meant the homepage carousel
 * would have had to keep its own copy in step by hand. Reviews are quoted
 * verbatim and attributed to real people, so there is exactly one source.
 */
export interface Review {
  title: string;
  name: string;
  location: string;
  text: string;
  type?: "sales" | "lettings" | "landlord";
}

export const BANC_REVIEWS: Review[] = [
  {
    title: "Thank you to the whole team",
    name: "Dawn",
    location: "Leefe Way, Cuffley",
    text: "We have just sold our house through Banc Property Group and it was such a positive experience. I cannot speak highly enough of Andrew who couldn't have been more helpful. We achieved the asking price very quickly. If I am selling again I would go straight to Banc. Thank you to the whole team.",
    type: "sales"
  },
  {
    title: "I definitely would recommend working with them",
    name: "Tammy",
    location: "Hollybush Way, Cheshunt",
    text: "Banc have been fantastic in the one year we have worked with them as tenants. All staff are lovely, work very hard to resolve issues and respond very quickly to all queries. The initial viewing and sign up process was also very fast and easy I definitely would recommend working with them!",
    type: "lettings"
  },
  {
    title: "Exceeded Expectations",
    name: "Pembe",
    location: "Goffs Crescent, Goffs Oak",
    text: "Highly recommend Banc estate agent. They're a great team, very friendly and always happy to help with any questions you might have along the way. They really have exceeded expectations and provide a professional service."
  },
  {
    title: "Extremely Helpful",
    name: "James",
    location: "Myles Court, Goffs Oak",
    text: "The entire team were extremely helpful finding a rental property. The process was made extremely smooth, paperwork was simple, clear and concise and I was able to move in very quickly. They are quick to respond to emails and ensure issues are resolve very promptly. I would definitely recommend and use them again.",
    type: "lettings"
  },
  {
    title: "Very professional friendly team",
    name: "Iwona",
    location: "Chestnut Close, Oakwood",
    text: "Andrew, Nitesh and Vicky sold my house quickly and efficiently. Very professional friendly team supported me through the process. I am a happy, satisfied customer and can highly recommend Banc estate agents."
  },
  {
    title: "Customer Service is excellent",
    name: "Agatha",
    location: "Tolmers Road, Cuffley",
    text: "I highly recommend Banc Property Group. I recently sold and purchased via Banc they were responsive, polite, and kept me informed during the process. Customer Service is excellent. The team Nitesh, Andrew and Vicki were a delight to deal with. Many thanks"
  },
  {
    title: "Professional team",
    name: "George & Soulla",
    location: "Tolmers Road, Cuffley",
    text: "We can't recommend Banc enough! Andrew was supportive, loyal, and honest through the process and communicated with us throughout. All the administration was quick and efficient and never gave us a reason to stress. We sold our property with Banc and found our dream home with Banc, double win! We were so grateful for all the support from the team. Massive thank you again!"
  },
  {
    title: "Thanks Again",
    name: "Sanil and Raki",
    location: "Nursery Gardens, Goffs Oak",
    text: "My wife and I highly recommend Nitesh and the Banc team. They supported us through our first house purchase for a property in Goffs Oak and were professional, prompt with regards to any questions we had and courteous from start to finish. We are hoping we don't need to move again but if we were ever to consider it, we would have no hesitation in using Nitesh and Banc as our listing agent. Thanks again!"
  },
  {
    title: "You really know what you're talking about",
    name: "Lesley & James",
    location: "Beverley Gardens, Cheshunt",
    text: "You guys are brilliant, when you valued our property at a much higher price than other agents we were sceptical we could achieve that but it sold for exactly that. You really know what you're talking about and because of your expert knowledge we were able to move to a location we thought we couldn't afford."
  },
  {
    title: "Thank you to all the staff at Banc Property Group",
    name: "Gerard and Thuzar",
    location: "Barrow Lane, Cheshunt",
    text: "Thank you to all the staff at Banc Property Group for making our house sale and purchase a pleasant experience. We have dealt with agents in the past but you and your team have done above and beyond in dealing with our sale and purchase. We would not hesitate in recommending Banc Property Group to friends and family."
  },
  {
    title: "I will only use Banc from now on",
    name: "Stuart Heath",
    location: "Churchgate, Cheshunt",
    text: "Banc are a very professional company. They have been letting 4 of my properties over the last 7 years with no issues. There always fully occupied with good tenants. I am really impressed with the speed that they find new tenants when the old tenant's leave. I have had trouble with other lettings agencies in the past. I will only use Banc from now on.",
    type: "landlord"
  },
  {
    title: "Highly Recommend",
    name: "Hazel",
    location: "Pollards Close, Goffs Oak",
    text: "Love the whole team, kept in touch the whole-time during viewing, sale and completion. Can highly recommend them and have done to everyone that has asked how our move has been. Be friends made during this sale. Will definitely keep in touch with all of them."
  }
];
