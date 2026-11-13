import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { BANC_LOGO_PATH } from "@/lib/schema-org";
import { absoluteUrl } from "@/lib/site";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { NewsletterSignupBox } from "@/components/NewsletterSignupBox";
import Footer from "@/components/Footer";
import { getAllPosts, getFeaturedPosts, getAllCategories, formatDate } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import {
  choiceChip,
  eyebrow,
  eyebrowOnDark,
  sectionHeading,
  sectionHeadingOnDark,
  sectionPadding,
} from "@/components/ui/form-styles";

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

        <PageBand
          eyebrow="Insights & Advice"
          title="Banc Property Blog"
          lede="Expert insights on the property market in Hertfordshire and London. Tips for buyers, sellers, and landlords from our experienced team."
          image={{ src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80", alt: "", priority: true }}
        />

        {/* Categories */}
        <section className="border-b border-banc-line bg-banc-grey-pale px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className={eyebrow}>Categories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog/category/${category.slug}`}
                  className={choiceChip(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <main>
          <div className={sectionPadding}>
            <div className="mx-auto max-w-7xl">
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <section className="mb-12 lg:mb-20">
                  <p className={eyebrow}>Featured</p>
                  <h2 className={cn(sectionHeading, "mt-3")}>Featured Articles</h2>
                  <div className="mt-7 grid gap-6 lg:grid-cols-2 lg:gap-8">
                    {featuredPosts.map((post) => (
                      <article key={post.slug} className="group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white">
                        <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
                          <div className="relative aspect-[16/9] overflow-hidden">
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                          <div className="flex flex-1 flex-col p-5 sm:p-6">
                            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-banc-muted-readable">
                              <span className="font-medium uppercase tracking-[0.14em]">Featured</span>
                              <span>{formatDate(post.date)}</span>
                              <span>{post.readingTime}</span>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-banc-dark underline-offset-4 group-hover:underline">
                              {post.title}
                            </h3>
                            <p className="mb-4 flex-1 text-sm text-banc-muted-readable line-clamp-2">
                              {post.description}
                            </p>
                            <span className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-banc-focus">
                              Read Article
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
                <p className={eyebrow}>Latest</p>
                <h2 className={cn(sectionHeading, "mt-3")}>Latest Articles</h2>
                <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <article key={post.slug} className="group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white">
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
                          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-banc-muted-readable">
                            <span className="font-medium uppercase tracking-[0.14em]">{post.category.replace("-", " ")}</span>
                            <span>{post.readingTime}</span>
                          </div>
                          <h3 className="mb-2 text-base font-semibold text-banc-dark underline-offset-4 group-hover:underline line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="mb-4 flex-1 text-sm text-banc-muted-readable line-clamp-3">
                            {post.description}
                          </p>
                          <p className="text-sm text-banc-muted-readable">{post.author}</p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Newsletter CTA */}
          <section className={cn(sectionPadding, "banc-dark-surface bg-banc-dark-deep text-white")}>
            <div className="mx-auto max-w-7xl">
              <div className="max-w-2xl">
                <p className={eyebrowOnDark}>Newsletter</p>
                <h2 className={cn(sectionHeadingOnDark, "mt-3")}>
                  Stay Updated with Property Insights
                </h2>
                <p className="mt-4 text-white/70">
                  Subscribe to our newsletter for the latest market news, tips, and exclusive property alerts.
                </p>
                <NewsletterSignupBox />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
