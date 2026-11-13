import type { Metadata } from "next";
import { withPageDefaults } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostsByAuthor, getAuthorBySlug, formatDate } from "@/lib/blog";
import { Mail, Linkedin, Twitter } from "lucide-react";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import { actionSecondary, eyebrow, sectionHeading, sectionPadding } from "@/components/ui/form-styles";

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

      <PageBand
        eyebrow={author.role}
        title={author.name}
        lede={author.bio}
        back={{ href: "/blog", label: "Back to Blog" }}
        image={{ src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80", alt: "", priority: true }}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src={author.image}
              alt={author.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          {author.social && (
            <div className="flex flex-wrap gap-x-6">
              {author.social.email && (
                <a href={`mailto:${author.social.email}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  <span>Email</span>
                </a>
              )}
              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                  <Linkedin className="h-5 w-5" aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>
              )}
              {author.social.twitter && (
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                  <Twitter className="h-5 w-5" aria-hidden="true" />
                  <span>Twitter</span>
                </a>
              )}
            </div>
          )}
        </div>
      </PageBand>

      {/* Posts Grid */}
      <main className={sectionPadding}>
        <div className="mx-auto max-w-7xl">
          <p className={eyebrow}>Articles</p>
          <h2 className={cn(sectionHeading, "mb-7 mt-3")}>
            Articles by {author.name}
          </h2>

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
                        <span className="font-medium uppercase tracking-[0.14em]">{post.category.replace("-", " ")}</span>
                        <span>{formatDate(post.date)}</span>
                        <span>{post.readingTime}</span>
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-banc-dark underline-offset-4 group-hover:underline line-clamp-2">
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
            <div className="border-t border-banc-dark/15 pt-8">
              <p className="text-lg text-banc-muted-readable">
                No posts found from this author yet.
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
