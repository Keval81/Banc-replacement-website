import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  getPostBySlug,
  getAllPosts,
  getRelatedPosts,
  getAuthorBySlug,
  formatDate,
  generateBlogPostStructuredData,
} from "@/lib/blog";
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
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: `/api/og?type=blog&title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.description)}`,
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
      images: [`/api/og?type=blog&title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.description)}`],
    },
    alternates: {
      canonical: `https://bancproperty.com/blog/${post.slug}`,
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

  const author = getAuthorBySlug(
    getAllPosts().find((p) => p.author === post.author)?.author || ""
  );
  const relatedPosts = getRelatedPosts(slug, 3);
  const structuredData = generateBlogPostStructuredData(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="min-h-screen bg-white">
        <Header />

        {/* Breadcrumb */}
        <div className="bg-[#F4F3F1] border-b border-[#E0DFDC]">
          <div className="mx-auto max-w-7xl px-4 lg:px-10 py-3">
            <nav className="flex items-center gap-2 text-sm text-[#8A8880]">
              <Link href="/" className="hover:text-[#4AC8E8] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-[#4AC8E8] transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-[#2C2A27] truncate max-w-[200px] sm:max-w-[400px]">
                {post.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <header className="mx-auto max-w-4xl px-4 pt-12 lg:px-10 lg:pt-16">
          <div className="mb-4">
            <Link
              href={`/blog/category/${post.category}`}
              className="inline-block rounded-full bg-[#4AC8E8]/10 px-3 py-1 text-sm font-medium text-[#4AC8E8] capitalize"
            >
              {post.category.replace("-", " ")}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#2C2A27] sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-[#8A8880]">{post.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#8A8880]">
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
            <article className="prose prose-lg max-w-none">
              {/* Content would be rendered from MDX */}
              <div className="text-[#3D3B37] leading-relaxed">
                <p className="text-lg mb-6">{post.excerpt}</p>
                <p className="mb-6">
                  This is a sample blog post content. In a production environment, 
                  this would be rendered from an MDX file with full support for 
                  markdown formatting, images, and custom components.
                </p>
                <h2 className="text-xl font-semibold text-[#2C2A27] mt-8 mb-4">
                  Key Insights
                </h2>
                <p className="mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do 
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim 
                  ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
                <h2 className="text-xl font-semibold text-[#2C2A27] mt-8 mb-4">
                  Expert Advice
                </h2>
                <p className="mb-6">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse 
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat 
                  cupidatat non proident, sunt in culpa qui officia deserunt mollit 
                  anim id est laborum.
                </p>
              </div>

              {/* Tags */}
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-sm text-[#8A8880]"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="mt-8 border-t border-[#E0DFDC] pt-8">
                <p className="mb-4 text-sm font-medium text-[#8A8880]">Share this article</p>
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
                <div className="rounded-xl border border-[#E0DFDC] p-6">
                  <p className="mb-4 text-sm font-medium text-[#8A8880]">Written by</p>
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
                      <p className="font-semibold text-[#2C2A27]">{author.name}</p>
                      <p className="text-sm text-[#8A8880]">{author.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[#8A8880]">{author.bio}</p>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-xl bg-[#4AC8E8] p-6 text-white">
                <h3 className="font-semibold">Looking to buy or sell?</h3>
                <p className="mt-2 text-sm text-white/90">
                  Get expert advice from our team of property professionals.
                </p>
                <Link href="/contact">
                  <Button className="mt-4 w-full bg-white text-[#4AC8E8] hover:bg-white/90">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </main>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-[#F4F3F1] py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 lg:px-10">
              <h2 className="mb-8 text-xl font-semibold text-[#2C2A27]">Related Articles</h2>
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
                        <h3 className="font-semibold text-[#2C2A27] transition-colors group-hover:text-[#4AC8E8]">
                          {relatedPost.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#8A8880] line-clamp-2">
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
            className="inline-flex items-center gap-2 text-[#4AC8E8] hover:underline"
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
