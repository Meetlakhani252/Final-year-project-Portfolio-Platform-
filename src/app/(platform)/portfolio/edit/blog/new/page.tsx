import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogEditor } from "@/components/portfolio/blog-editor";

export default async function NewBlogPostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <BlogEditor />;
}
