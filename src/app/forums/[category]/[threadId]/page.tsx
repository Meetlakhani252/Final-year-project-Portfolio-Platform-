import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUser } from "@/lib/get-user";
import { getThread, getReplies } from "@/actions/forums";
import { BlogContentRenderer } from "@/components/portfolio/blog-content-renderer";
import { VoteButton } from "@/components/forums/vote-button";
import { FlagButton } from "@/components/forums/flag-button";
import { ReplyList } from "@/components/forums/reply-list";

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ category: string; threadId: string }>;
}) {
  const { category: categorySlug, threadId } = await params;

  const [user, thread, repliesResult] = await Promise.all([
    getUser(),
    getThread(threadId),
    getReplies(threadId),
  ]);

  if (!thread) notFound();
  if (thread.category.slug !== categorySlug) notFound();

  const canInteract = user.role === "student";
  const isOwnPost = thread.author?.id === user.id;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/forums" className="hover:underline">
          Forums
        </Link>
        {" / "}
        <Link href={`/forums/${categorySlug}`} className="hover:underline">
          {thread.category.name}
        </Link>
        {" / "}
        <span className="text-foreground line-clamp-1">{thread.title}</span>
      </div>

      {/* Original post */}
      <div className="rounded-lg border bg-card p-6">
        <h1 className="text-xl font-bold leading-snug">{thread.title}</h1>

        <div className="mt-3 flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={thread.author?.avatar_url ?? undefined} />
            <AvatarFallback>
              {thread.author?.full_name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{thread.author?.full_name ?? "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {thread.flag_count >= 3 && (
          <div
            className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            title={thread.flagReason ?? undefined}
          >
            <AlertTriangle className="size-4 shrink-0" />
            This post has been flagged by the community.
            {thread.flagReason && (
              <span className="ml-1 text-destructive/70">Reason: {thread.flagReason}</span>
            )}
          </div>
        )}

        <div className="mt-5">
          <BlogContentRenderer content={thread.content} />
        </div>

        <div className="mt-5 flex items-center gap-3 border-t pt-4">
          <VoteButton
            postId={thread.id}
            initialCount={thread.upvote_count}
            initialVoted={thread.currentUserVoted}
            canVote={canInteract}
          />
          {canInteract && !isOwnPost && (
            <FlagButton
              targetType="post"
              targetId={thread.id}
              initialFlagged={thread.currentUserFlagged}
              canFlag={canInteract}
            />
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}
          </span>
        </div>
      </div>

      {/* Replies */}
      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold">
          {thread.reply_count === 0
            ? "No replies yet"
            : `${thread.reply_count} ${thread.reply_count === 1 ? "Reply" : "Replies"}`}
        </h2>
        <ReplyList
          postId={thread.id}
          initialReplies={repliesResult.replies}
          initialNextCursor={repliesResult.nextCursor}
          currentUserId={user.id}
          canReply={canInteract}
        />
      </div>
    </div>
  );
}
