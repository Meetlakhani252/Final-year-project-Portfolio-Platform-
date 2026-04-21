import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getCategories } from "@/actions/forums";

export default async function ForumsPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Forums</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discuss topics, ask questions, and connect with the community.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/forums/${category.slug}`}
            className="flex items-center gap-4 rounded-lg border bg-card p-5 hover:bg-accent/50 transition-colors"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold">{category.name}</p>
              {category.description && (
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{category.postCount}</p>
              <p>{category.postCount === 1 ? "post" : "posts"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
