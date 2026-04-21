"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovelEditor } from "@/components/forums/novel-editor";
import { createForumPost } from "@/actions/forums";
import type { JSONContent } from "novel";

interface NewPostFormProps {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
}

export function NewPostForm({
  categoryId,
  categorySlug,
  categoryName,
}: NewPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!content) {
      setError("Content is required.");
      return;
    }

    startTransition(async () => {
      try {
        const post = await createForumPost(categoryId, title.trim(), content);
        router.push(`/forums/thread/${post.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create post.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Input id="category" value={categoryName} disabled />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Give your thread a descriptive title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {title.length}/200
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Content</Label>
        <NovelEditor onChange={setContent} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Posting…
            </>
          ) : (
            "Post Thread"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/forums/${categorySlug}`)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
