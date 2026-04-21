import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/get-user";
import { getCategoryBySlug } from "@/actions/forums";
import { NewPostForm } from "@/components/forums/new-post-form";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const [user, category] = await Promise.all([
    getUser(),
    getCategoryBySlug(slug),
  ]);

  if (!category) notFound();

  if (user.role !== "student") {
    redirect(`/forums/${slug}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-1 text-sm text-muted-foreground">
          <Link href="/forums" className="hover:underline">
            Forums
          </Link>
          {" / "}
          <Link href={`/forums/${slug}`} className="hover:underline">
            {category.name}
          </Link>
          {" / "}
          New Post
        </div>
        <h1 className="text-2xl font-bold">New Thread</h1>
      </div>

      <NewPostForm
        categoryId={category.id}
        categorySlug={slug}
        categoryName={category.name}
      />
    </div>
  );
}
