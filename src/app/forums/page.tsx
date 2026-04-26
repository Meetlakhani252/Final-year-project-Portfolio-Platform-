import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getCategories } from "@/actions/forums";

export default async function ForumsPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-5xl py-10">
      <div className="mb-10 space-y-2">
        <h1 className="font-mono text-4xl font-bold tracking-tight text-white">
          <span className="text-primary">Intel:</span> Community Forums
        </h1>
        <p className="text-muted-foreground max-w-lg">
          Synchronize with peers, exchange knowledge, and participate in open discussion protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/forums/${category.slug}`}
            className="group relative flex flex-col gap-4 rounded-xl glass-card p-6 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6" />
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-primary">{category.postCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Entries</p>
              </div>
            </div>

            <div className="mt-2">
              <p className="font-mono text-xl font-bold text-white group-hover:text-primary transition-colors">{category.name}</p>
              {category.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 font-sans leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
            
            <div className="mt-auto pt-4 flex items-center text-[10px] font-mono text-primary/50 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
               Access Category &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
