import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { BlogContentRenderer } from "@/components/portfolio/blog-content-renderer";
import { CommentSection } from "@/components/portfolio/comment-section";
import type { JSONContent } from "novel";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!profile) return { title: "Post not found" };

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title")
    .eq("profile_id", profile.id)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} — @${username}`,
  };
}

export default async function PublicBlogPostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  let currentUserRole: string | null = null;
  if (currentUser) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();
    currentUserRole = currentProfile?.role ?? null;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <Link
        href={`/u/${username}`}
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to portfolio
      </Link>

      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{profile.full_name}</span>
            <span>·</span>
            <time>
              {new Date(
                post.published_at || post.created_at
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
        </header>

        <BlogContentRenderer content={post.content as JSONContent} />
      </article>

      <section className="mt-10 border-t pt-8">
        <CommentSection
          targetType="blog_post"
          targetId={post.id}
          currentUserId={currentUser?.id ?? null}
          currentUserRole={currentUserRole}
          portfolioOwnerId={profile.id}
        />
      </section>
    </main>
  );
}
