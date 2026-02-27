import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  featuredImage: string;
  content: string;
  readingTime: string;
  excerpt: string;
  published: boolean;
  featured: boolean;
}

export interface BlogAuthor {
  name: string;
  slug: string;
  image: string;
  bio: string;
  role: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

const postsDirectory = path.join(process.cwd(), "content/blog");

// Sample authors
export const authors: BlogAuthor[] = [
  {
    name: "James Harrington",
    slug: "james-harrington",
    image: "/banc-logo.png",
    bio: "Senior Property Consultant with over 15 years experience in the Hertfordshire property market. Specialising in premium residential sales and valuations.",
    role: "Senior Property Consultant",
    social: {
      linkedin: "https://linkedin.com/in/jamesharrington",
      email: "james.harrington@banc.co.uk",
    },
  },
  {
    name: "Sarah Mitchell",
    slug: "sarah-mitchell",
    image: "/banc-logo.png",
    bio: "Marketing Director with expertise in property marketing strategy and digital innovation in real estate.",
    role: "Marketing Director",
    social: {
      twitter: "https://twitter.com/sarahmitchell",
      linkedin: "https://linkedin.com/in/sarahmitchell",
      email: "sarah.mitchell@banc.co.uk",
    },
  },
  {
    name: "David Chen",
    slug: "david-chen",
    image: "/banc-logo.png",
    bio: "Area Specialist for Cuffley and surrounding villages. Expert in family homes and countryside properties.",
    role: "Area Specialist",
    social: {
      linkedin: "https://linkedin.com/in/davidchen",
      email: "david.chen@banc.co.uk",
    },
  },
];

export const categories = [
  {
    name: "Market News",
    slug: "market-news",
    description: "Latest updates on the property market in Hertfordshire and London",
  },
  {
    name: "Area Guides",
    slug: "area-guides",
    description: "In-depth guides to the best areas in Hertfordshire and North London",
  },
  {
    name: "Selling Tips",
    slug: "selling-tips",
    description: "Expert advice on preparing and selling your property",
  },
  {
    name: "Buying Tips",
    slug: "buying-tips",
    description: "Guidance for first-time buyers and experienced purchasers",
  },
  {
    name: "Landlord Advice",
    slug: "landlord-advice",
    description: "Tips and insights for property investors and landlords",
  },
];

export function getAllPosts(): BlogPost[] {
  // If directory doesn't exist, return sample posts
  if (!fs.existsSync(postsDirectory)) {
    return getSamplePosts();
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const readTime = readingTime(content);

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        author: data.author || "Banc Property Group",
        authorImage: data.authorImage,
        category: data.category || "market-news",
        tags: data.tags || [],
        featuredImage: data.featuredImage || "/banc-logo.png",
        content,
        readingTime: readTime.text,
        excerpt: data.excerpt || content.slice(0, 200).replace(/#/g, "").trim() + "...",
        published: data.published !== false,
        featured: data.featured === true,
      };
    });

  // Filter published posts and sort by date
  return allPosts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export function getPostsByCategory(category: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.category === category);
}

export function getPostsByAuthor(authorSlug: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter((post) => {
    const author = authors.find((a) => a.name === post.author);
    return author?.slug === authorSlug;
  });
}

export function getFeaturedPosts(limit: number = 3): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.featured).slice(0, limit);
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const posts = getAllPosts();
  const currentPost = posts.find((p) => p.slug === currentSlug);
  if (!currentPost) return posts.slice(0, limit);

  return posts
    .filter(
      (post) =>
        post.slug !== currentSlug &&
        (post.category === currentPost.category ||
          post.tags.some((tag) => currentPost.tags.includes(tag)))
    )
    .slice(0, limit);
}

export function getAllCategories() {
  return categories;
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getAuthorBySlug(slug: string) {
  return authors.find((a) => a.slug === slug);
}

// Sample posts for development
function getSamplePosts(): BlogPost[] {
  return [
    {
      slug: "top-tips-selling-home",
      title: "Top 10 Tips for Selling Your Home in 2024",
      description: "Expert advice on preparing your property for sale, from staging to pricing strategy.",
      date: "2024-01-15",
      author: "James Harrington",
      category: "selling-tips",
      tags: ["selling", "tips", "home improvement", "staging"],
      featuredImage: "/hertfordshire-home-1.png",
      content: "",
      readingTime: "5 min read",
      excerpt: "Selling your home can be a complex process, but with the right preparation and strategy, you can achieve the best possible price. Here are our top 10 tips for selling your home in 2024...",
      published: true,
      featured: true,
    },
    {
      slug: "area-guide-cuffley",
      title: "Area Guide: Why Cuffley is Perfect for Families",
      description: "Discover why Cuffley is one of Hertfordshire's most sought-after villages for family living.",
      date: "2024-01-10",
      author: "David Chen",
      category: "area-guides",
      tags: ["cuffley", "family", "hertfordshire", "schools"],
      featuredImage: "/hertfordshire-home-4.png",
      content: "",
      readingTime: "7 min read",
      excerpt: "Cuffley is a charming village located in the heart of Hertfordshire, offering the perfect blend of countryside charm and modern convenience. Here's why it's ideal for families...",
      published: true,
      featured: true,
    },
    {
      slug: "property-market-hertfordshire",
      title: "Understanding the Property Market in Hertfordshire",
      description: "A comprehensive analysis of current trends and future predictions for Hertfordshire property.",
      date: "2024-01-05",
      author: "Sarah Mitchell",
      category: "market-news",
      tags: ["market analysis", "hertfordshire", "trends", "investment"],
      featuredImage: "/banc-logo.png",
      content: "",
      readingTime: "6 min read",
      excerpt: "The Hertfordshire property market continues to show resilience despite broader economic uncertainties. In this analysis, we explore current trends and what they mean for buyers and sellers...",
      published: true,
      featured: false,
    },
  ];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateBlogPostStructuredData(post: BlogPost) {
  const author = authors.find((a) => a.name === post.author);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.featuredImage.startsWith("http")
      ? post.featuredImage
      : `https://bancproperty.com${post.featuredImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
      url: author ? `https://bancproperty.com/blog/author/${author.slug}` : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "Banc Property Group",
      logo: {
        "@type": "ImageObject",
        url: "https://bancproperty.com/banc-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://bancproperty.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };
}
