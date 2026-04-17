import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogEditor } from "@/components/portfolio/blog-editor";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!post) {
    notFound();
  }

  return <BlogEditor post={post} />;
}
