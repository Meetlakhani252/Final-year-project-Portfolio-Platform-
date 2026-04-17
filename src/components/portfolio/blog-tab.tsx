"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteBlogPost } from "@/actions/portfolio";
import type { BlogPost } from "@/types/portfolio";

export function BlogTab({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteBlogPost(id);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Post deleted");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Write and publish blog posts on your portfolio.
          </CardDescription>
        </div>
        <Button
          onClick={() => router.push("/portfolio/edit/blog/new")}
          className="min-h-[44px]"
        >
          <Plus className="mr-2 size-4" />
          New post
        </Button>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No blog posts yet</p>
              <p className="text-xs text-muted-foreground">
                Write your first blog post to share your thoughts and
                experiences.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">{post.title}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        post.published_at || post.created_at
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit post"
                    onClick={() =>
                      router.push(`/portfolio/edit/blog/${post.id}`)
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete post"
                    disabled={isPending && deletingId === post.id}
                    onClick={() => onDelete(post.id, post.title)}
                  >
                    {isPending && deletingId === post.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
