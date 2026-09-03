import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, Facebook, Twitter, Linkedin } from "lucide-react";

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

        {/* Breadcrumb */}
        <div className="bg-banc-grey-pale border-b border-banc-line">
          <div className="mx-auto max-w-7xl px-4 lg:px-10 py-3">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-banc-muted-readable">
                <li>
                  <Link href="/" className="hover:text-banc-sky transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="hover:text-banc-sky transition-colors">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li
                  aria-current="page"
                  className="text-banc-dark truncate max-w-[200px] sm:max-w-[400px]"
                >
                  {post.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <header className="mx-auto max-w-4xl px-4 pt-12 lg:px-10 lg:pt-16">
          <div className="mb-4">
            <Link
              href={`/blog/category/${post.category}`}
              className="inline-block rounded-full bg-banc-sky/10 px-3 py-1 text-sm font-medium text-banc-focus capitalize"
            >
              {post.category.replace("-", " ")}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-banc-dark sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-banc-muted-readable">{post.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-banc-muted-readable">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.author}
            </span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mx-auto max-w-5xl px-4 mt-8 lg:px-10 lg:mt-12">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>

        {/* Article Content */}
        <main className="mx-auto max-w-4xl px-4 py-12 lg:px-10 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
            {/* Main Content */}
            <article className="max-w-none">
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
                    className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-sm text-banc-muted-readable"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="mt-8 border-t border-banc-line pt-8">
                <p className="mb-4 text-sm font-medium text-banc-muted-readable">Share this article</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Author Card */}
              {author && (
                <div className="rounded-xl border border-banc-line p-6">
                  <p className="mb-4 text-sm font-medium text-banc-muted-readable">Written by</p>
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src={author.image}
                        alt={author.name}
                        fill
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
              <div className="rounded-xl bg-banc-focus p-6 text-white">
                <h3 className="font-semibold">Looking to buy or sell?</h3>
                <p className="mt-2 text-sm text-white/90">
                  Get expert advice from our team of property professionals.
                </p>
                <Link href="/contact">
                  <Button className="mt-4 w-full bg-white text-banc-focus hover:bg-white/90">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </main>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-banc-grey-pale py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 lg:px-10">
              <h2 className="mb-8 text-xl font-semibold text-banc-dark">Related Articles</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.slug}
                    className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-banc-dark transition-colors group-hover:text-banc-sky">
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
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-banc-focus hover:underline"
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
