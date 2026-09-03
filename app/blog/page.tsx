import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { BANC_LOGO_PATH } from "@/lib/schema-org";
import { absoluteUrl } from "@/lib/site";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getAllPosts, getFeaturedPosts, getAllCategories, formatDate } from "@/lib/blog";
import { ArrowRight, Calendar, Clock, User, Tag } from "lucide-react";

export const metadata: Metadata = withPageDefaults("/blog", {
  title: "Blog | Property News, Tips & Area Guides",
  description: "Expert insights on the property market in Hertfordshire and London. Tips for buyers, sellers, and landlords from Banc Property Group.",
  openGraph: {
    title: "Banc Property Blog | Property News, Tips & Area Guides",
    description: "Expert insights on the property market in Hertfordshire and London. Tips for buyers, sellers, and landlords.",
    type: "website",
  },
});

export const revalidate = 3600;

// Organization structured data
const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Banc Property Blog",
  description: "Expert insights on the property market in Hertfordshire and London",
  url: absoluteUrl("/blog"),
  publisher: {
    "@type": "Organization",
    name: "Banc Property Group",
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(BANC_LOGO_PATH),
    },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPosts = getFeaturedPosts(2);
  const categories = getAllCategories();

  return (
    <>
      <JsonLd data={organizationStructuredData} />
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-banc-dark-deep py-16 lg:py-24">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-banc-dark-deep/80 via-banc-dark-deep/60 to-banc-dark-deep/40" />
        </div>
          <div className="mx-auto max-w-7xl px-4 lg:px-10">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-banc-sky">
                Insights & Advice
              </p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                Banc Property Blog
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/70 lg:text-lg">
                Expert insights on the property market in Hertfordshire and London. 
                Tips for buyers, sellers, and landlords from our experienced team.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-banc-line bg-banc-grey-pale">
          <div className="mx-auto max-w-7xl px-4 lg:px-10">
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="mr-2 text-sm font-medium text-banc-muted-readable">Categories:</span>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog/category/${category.slug}`}
                  className="rounded-full bg-white px-4 py-2 text-sm text-banc-dark-mid shadow-sm transition-colors hover:bg-banc-sky hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-4 py-12 lg:px-10 lg:py-16">
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-8 text-xl font-semibold text-banc-dark">Featured Articles</h2>
              <div className="grid gap-8 lg:grid-cols-2">
                {featuredPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute left-4 top-4 rounded-full bg-banc-focus px-3 py-1 text-xs font-semibold text-white">
                          Featured
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex items-center gap-4 text-sm text-banc-muted-readable">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(post.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readingTime}
                          </span>
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-banc-dark transition-colors group-hover:text-banc-sky">
                          {post.title}
                        </h3>
                        <p className="mb-4 text-sm text-banc-muted-readable line-clamp-2">
                          {post.description}
                        </p>
                        <span className="inline-flex items-center text-sm font-medium text-banc-focus">
                          Read Article
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* All Posts */}
          <section>
            <h2 className="mb-8 text-xl font-semibold text-banc-dark">Latest Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group flex flex-col overflow-hidden rounded-xl border border-banc-line bg-white transition-shadow hover:shadow-lg"
                >
                  <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-banc-muted-readable">
                        <span className="rounded-full bg-[#F3F4F6] px-2 py-1 capitalize">
                          {post.category.replace("-", " ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime}
                        </span>
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-banc-dark transition-colors group-hover:text-banc-sky line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="mb-4 flex-1 text-sm text-banc-muted-readable line-clamp-3">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-banc-muted-readable">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="mt-16 rounded-2xl bg-banc-dark-deep p-8 lg:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-xl font-semibold text-white lg:text-2xl">
                Stay Updated with Property Insights
              </h2>
              <p className="mt-3 text-sm text-white/70">
                Subscribe to our newsletter for the latest market news, tips, and exclusive property alerts.
              </p>
              <form className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-banc-sky"
                />
                <Button className="bg-banc-focus px-6 py-3 text-sm font-semibold text-white hover:bg-banc-sky-dark">
                  Subscribe
                </Button>
              </form>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
