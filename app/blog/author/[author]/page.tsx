import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostsByAuthor, getAuthorBySlug, formatDate } from "@/lib/blog";
import { ArrowLeft, Calendar, Clock, Mail, Linkedin, Twitter } from "lucide-react";

interface AuthorPageProps {
  params: Promise<{
    author: string;
  }>;
}

// Generate static params for all authors
export async function generateStaticParams() {
  const authors = [
    { slug: "james-harrington" },
    { slug: "sarah-mitchell" },
    { slug: "david-chen" },
  ];
  return authors.map((author) => ({
    author: author.slug,
  }));
}

// Generate metadata for each author
export const revalidate = 3600;

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { author: authorSlug } = await params;
  const author = getAuthorBySlug(authorSlug);

  if (!author) {
    return {
      title: "Author Not Found",
    };
  }

  return withPageDefaults(`/blog/author/${author.slug}`, {
    title: `${author.name} | Property Expert & Writer`,
    description: `${author.bio} Read articles by ${author.name} on the Banc Property blog.`,
    openGraph: {
      title: `${author.name} | Banc Property Expert`,
      description: author.bio,
      type: "profile",
    },
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { author: authorSlug } = await params;
  const author = getAuthorBySlug(authorSlug);

  if (!author) {
    notFound();
  }

  const posts = getPostsByAuthor(authorSlug);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-banc-dark-deep py-12 lg:py-20">
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
          <Link
            href="/blog"
            className="mb-4 inline-flex items-center gap-2 text-banc-sky hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-banc-sky">
              <Image
                src={author.image}
                alt={author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-banc-sky">
                {author.role}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                {author.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/70">
                {author.bio}
              </p>
              {author.social && (
                <div className="mt-6 flex gap-4">
                  {author.social.email && (
                    <a
                      href={`mailto:${author.social.email}`}
                      className="flex items-center gap-2 text-white/70 transition-colors hover:text-banc-sky"
                    >
                      <Mail className="h-5 w-5" />
                      <span className="text-sm">Email</span>
                    </a>
                  )}
                  {author.social.linkedin && (
                    <a
                      href={author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white/70 transition-colors hover:text-banc-sky"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                  {author.social.twitter && (
                    <a
                      href={author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white/70 transition-colors hover:text-banc-sky"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-sm">Twitter</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-10 lg:py-16">
        <h2 className="mb-8 text-xl font-semibold text-banc-dark">
          Articles by {author.name}
        </h2>

        {posts.length > 0 ? (
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
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime}
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-banc-dark transition-colors group-hover:text-banc-sky line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="flex-1 text-sm text-banc-muted-readable line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-banc-muted-readable">
              No posts found from this author yet.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-block text-banc-focus hover:underline"
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
