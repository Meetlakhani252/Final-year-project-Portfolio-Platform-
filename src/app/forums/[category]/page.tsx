import { notFound } from "next/navigation";
import Link from "next/link";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/get-user";
import { getCategoryBySlug, getThreads } from "@/actions/forums";
import { ThreadList } from "@/components/forums/thread-list";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;

  const [category, user, threadsResult] = await Promise.all([
    getCategoryBySlug(slug),
    getUser(),
    getThreads(slug),
  ]);

  if (!category) notFound();

  const canPost = user.role === "student";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 text-sm text-muted-foreground">
            <Link href="/forums" className="hover:underline">
              Forums
            </Link>
            {" / "}
            {category.name}
          </div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>

        {canPost && (
          <Button
            render={<Link href={`/forums/${slug}/new`} />}
            className="shrink-0"
          >
            <PenSquare className="size-4" />
            New Post
          </Button>
        )}
      </div>

      <ThreadList
        categorySlug={slug}
        initialThreads={threadsResult.threads}
        initialNextCursor={threadsResult.nextCursor}
      />
    </div>
  );
}
