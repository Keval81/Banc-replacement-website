import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostsByCategory, getAllCategories, getCategoryBySlug, formatDate } from "@/lib/blog";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

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
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} | Blog Category`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Banc Property Blog`,
      description: category.description,
      type: "website",
    },
    alternates: {
      canonical: `https://bancproperty.com/blog/category/${category.slug}`,
    },
  };
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

      {/* Hero */}
      <section className="bg-[#2C2F33] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <Link
            href="/blog"
            className="mb-4 inline-flex items-center gap-2 text-[#1DBFDD] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/70 lg:text-lg">
            {category.description}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-10 lg:py-16">
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-lg"
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
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime}
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-[#111827] transition-colors group-hover:text-[#1DBFDD] line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mb-4 flex-1 text-sm text-[#6B7280] line-clamp-3">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-[#6B7280]">
              No posts found in this category yet.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-block text-[#1DBFDD] hover:underline"
            >
              Browse all articles
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
