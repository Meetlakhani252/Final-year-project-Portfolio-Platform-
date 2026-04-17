"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import {
  EditorRoot,
  EditorContent,
  type JSONContent,
  StarterKit,
  TiptapLink,
  TiptapUnderline,
  Placeholder,
  TaskList,
  TaskItem,
  HorizontalRule,
} from "novel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveBlogPost,
  publishBlogPost,
  unpublishBlogPost,
} from "@/actions/portfolio";
import type { BlogPost } from "@/types/portfolio";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractPlainText(json: JSONContent): string {
  let text = "";
  if (json.text) text += json.text;
  if (json.content) {
    for (const child of json.content) {
      text += extractPlainText(child);
    }
    if (json.type === "paragraph" || json.type === "heading") {
      text += "\n";
    }
  }
  return text;
}

export function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!post);
  const [content, setContent] = useState<JSONContent>(
    (post?.content as JSONContent) ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    }
  );
  const [isPending, startTransition] = useTransition();

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (!slugManual) {
        setSlug(slugify(val));
      }
    },
    [slugManual]
  );

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(slugify(val));
  }

  function save(andPublish?: boolean) {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    startTransition(async () => {
      const plainText = extractPlainText(content).trim();
      const result = await saveBlogPost(
        {
          title: title.trim(),
          slug: slug.trim(),
          content,
          content_plain: plainText || null,
        },
        post?.id
      );

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (andPublish && result.data) {
        const pubResult = await publishBlogPost(result.data.id);
        if (!pubResult.ok) {
          toast.error(pubResult.error);
          return;
        }
        toast.success("Post published");
      } else {
        toast.success(post ? "Post saved" : "Draft saved");
      }

      router.push("/portfolio/edit?tab=blog");
      router.refresh();
    });
  }

  function handleUnpublish() {
    if (!post?.id) return;
    startTransition(async () => {
      const result = await unpublishBlogPost(post.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Post unpublished");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/portfolio/edit?tab=blog")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to posts
        </Button>
        <div className="flex items-center gap-2">
          {post?.status === "published" && (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={isPending}
            >
              <EyeOff className="mr-2 size-4" />
              Unpublish
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => save()}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save draft
          </Button>
          <Button onClick={() => save(true)} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Eye className="mr-2 size-4" />
            )}
            {post?.status === "published" ? "Save & publish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="text-lg font-semibold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-slug">Slug</Label>
          <Input
            id="blog-slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="post-slug"
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <div className="min-h-[400px] rounded-md border">
            <EditorRoot>
              <EditorContent
                initialContent={content}
                extensions={[
                  StarterKit,
                  TiptapLink.configure({ openOnClick: false }),
                  TiptapUnderline,
                  Placeholder.configure({ placeholder: "Start writing…" }),
                  TaskList,
                  TaskItem.configure({ nested: true }),
                  HorizontalRule,
                ]}
                onUpdate={({ editor }) => {
                  setContent(editor.getJSON());
                }}
                className="prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none"
              />
            </EditorRoot>
          </div>
        </div>
      </div>
    </div>
  );
}
