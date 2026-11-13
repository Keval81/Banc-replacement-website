import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageBand } from "@/components/PageBand";
import { cn } from "@/lib/utils";
import { actionPrimary, eyebrow, sectionHeading, sectionPadding } from "@/components/ui/form-styles";
import { JsonLd } from "@/components/JsonLd";
import { MdxContent } from "@/components/blog/MdxContent";
import {
  authors,
  getPostBySlug,
  getAllPosts,
  getRelatedPosts,
  getCategoryBySlug,
  formatDate,
} from "@/lib/blog";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";
import { absoluteUrl } from "@/lib/site";
import { ArrowLeft, Facebook, Twitter, Linkedin } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post
export const revalidate = 3600;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: true },
    };
  }

  const canonical = absoluteUrl(`/blog/${post.slug}`);
  const ogImage = absoluteUrl(
    `/api/og?type=blog&title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.description)}`
  );

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: canonical,
      siteName: "Banc Property Group",
      locale: "en_GB",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
    keywords: post.tags,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const author = authors.find((a) => a.name === post.author);
  const category = getCategoryBySlug(post.category);
  const relatedPosts = getRelatedPosts(slug, 3);
  const postPath = `/blog/${post.slug}`;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: postPath },
  ];

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            headline: post.title,
            description: post.description,
            path: postPath,
            // "/banc-logo.png" is the loader's placeholder and does not exist
            // in /public, so fall back to the generated OG card instead.
            image:
              post.featuredImage === "/banc-logo.png"
                ? `/api/og?type=blog&title=${encodeURIComponent(post.title)}`
                : post.featuredImage,
            datePublished: post.date,
            authorName: post.author,
            authorPath: author ? `/blog/author/${author.slug}` : undefined,
            keywords: post.tags,
            section: category?.name ?? post.category,
          }),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />
      <div className="min-h-screen bg-white">
        <Header />

        <PageBand
          eyebrow="Banc Property Blog"
          title={post.title}
          lede={post.description}
          back={{ href: "/blog", label: "Back to Blog" }}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/70">
            <Link
              href={`/blog/category/${post.category}`}
              className="inline-flex min-h-11 items-center font-medium capitalize text-white underline underline-offset-4"
            >
              {post.category.replace("-", " ")}
            </Link>
            <span>{formatDate(post.date)}</span>
            <span>{post.readingTime}</span>
            <span>{post.author}</span>
          </div>
        </PageBand>

        {/* Breadcrumb */}
        <div className="border-b border-banc-line bg-banc-grey-pale">
          <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-10">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-banc-muted-readable">
                <li>
                  <Link href="/" className="inline-flex min-h-11 items-center transition-colors hover:text-banc-focus">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="inline-flex min-h-11 items-center transition-colors hover:text-banc-focus">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li
                  aria-current="page"
                  className="max-w-[200px] truncate text-banc-dark sm:max-w-[400px]"
                >
                  {post.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Article Content */}
        <main className={sectionPadding}>
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,48rem)_280px] lg:justify-between">
            {/* Main Content */}
            <article className="w-full max-w-3xl">
              {/* Featured Image */}
              <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-md)]">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 768px"
                />
              </div>

              <div className="text-banc-dark-mid">
                {post.content.trim() !== "" ? (
                  <MdxContent source={post.content} />
                ) : (
                  <p className="text-lg mb-6">{post.excerpt}</p>
                )}
              </div>

              {/* Tags */}
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-[var(--radius-md)] border border-banc-line px-3 py-1 text-sm text-banc-muted-readable"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="mt-8 border-t border-banc-dark/15 pt-8">
                <p className={cn(eyebrow, "mb-4")}>Share this article</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="h-11 gap-2 rounded-[var(--radius-md)] px-4">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="h-11 gap-2 rounded-[var(--radius-md)] px-4">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="h-11 gap-2 rounded-[var(--radius-md)] px-4">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Author */}
              {author && (
                <div className="border-t border-banc-dark/15 pt-6">
                  <p className={cn(eyebrow, "mb-4")}>Written by</p>
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src={author.image}
                        alt={author.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-banc-dark">{author.name}</p>
                      <p className="text-sm text-banc-muted-readable">{author.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-banc-muted-readable">{author.bio}</p>
                </div>
              )}

              {/* CTA */}
              <div className="border-t border-banc-dark/15 pt-6">
                <h3 className="font-semibold text-banc-dark-deep">Looking to buy or sell?</h3>
                <p className="mt-2 text-sm text-banc-muted-readable">
                  Get expert advice from our team of property professionals.
                </p>
                <Link href="/contact" className={cn(actionPrimary, "mt-4 sm:w-full")}>
                  Contact Us
                </Link>
              </div>
            </aside>
          </div>
        </main>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className={cn(sectionPadding, "bg-banc-grey-pale")}>
            <div className="mx-auto max-w-7xl">
              <p className={eyebrow}>Keep reading</p>
              <h2 className={cn(sectionHeading, "mt-3")}>Related Articles</h2>
              <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.slug} className="group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-banc-line bg-white">
                    <Link href={`/blog/${relatedPost.slug}`} className="flex flex-1 flex-col">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-banc-dark underline-offset-4 group-hover:underline">
                          {relatedPost.title}
                        </h3>
                        <p className="mt-2 text-sm text-banc-muted-readable line-clamp-2">
                          {relatedPost.description}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center gap-2 text-banc-focus hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
