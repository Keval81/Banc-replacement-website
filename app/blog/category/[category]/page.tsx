import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostsByCategory, getAllCategories, getCategoryBySlug, formatDate } from "@/lib/blog";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import { actionSecondary, sectionPadding } from "@/components/ui/form-styles";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category.slug,
  }));
}

// Generate metadata for each category
export const revalidate = 3600;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return withPageDefaults(`/blog/category/${category.slug}`, {
    title: `${category.name} | Blog Category`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Banc Property Blog`,
      description: category.description,
      type: "website",
    },
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const posts = getPostsByCategory(categorySlug);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <PageBand
        eyebrow="Blog category"
        title={category.name}
        lede={category.description}
        back={{ href: "/blog", label: "Back to Blog" }}
        image={{ src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80", alt: "", priority: true }}
      />

      {/* Posts Grid */}
      <main className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                        <span>{formatDate(post.date)}</span>
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
          ) : (
            <div className="border-t border-banc-dark/15 pt-8">
              <p className="text-lg text-banc-muted-readable">
                No posts found in this category yet.
              </p>
              <Link href="/blog" className={cn(actionSecondary, "mt-6")}>
                Browse all articles
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
