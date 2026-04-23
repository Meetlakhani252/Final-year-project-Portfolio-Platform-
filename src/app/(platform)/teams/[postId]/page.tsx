import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Mail,
  MessageSquare,
  MessagesSquare,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { getUser } from "@/lib/get-user";
import { getTeamPost, getTeamPostComments } from "@/actions/teams";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ClosePostButton } from "@/components/teams/close-post-button";
import { SendDmButton } from "@/components/teams/send-dm-button";
import { TeamCommentForm } from "@/components/teams/team-comment-form";
import { SuggestedTeammates } from "@/components/teams/suggested-teammates";

const CONTACT_ICONS = {
  dm: Mail,
  comment: MessageSquare,
  both: MessagesSquare,
} as const;

const CONTACT_LABELS = {
  dm: "Contact via DM only",
  comment: "Contact via comments only",
  both: "Contact via DM or comments",
} as const;

export default async function TeamPostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const [user, post, comments] = await Promise.all([
    getUser(),
    getTeamPost(postId),
    getTeamPostComments(postId),
  ]);

  if (!post) notFound();

  const isAuthor = user.id === post.profile_id;
  const isStudent = user.role === "student";
  const allowsDm =
    post.contact_preference === "dm" || post.contact_preference === "both";
  const allowsComment =
    post.contact_preference === "comment" || post.contact_preference === "both";

  const ContactIcon = CONTACT_ICONS[post.contact_preference];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to team listings
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {!post.is_open && (
            <Badge variant="outline" className="text-muted-foreground">
              Filled
            </Badge>
          )}
          {post.event && (
            <Badge variant="secondary">
              <CalendarDays className="mr-1 size-3" />
              {post.event.title}
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold sm:text-3xl">{post.title}</h1>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="size-6">
            <AvatarImage src={post.author?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {post.author?.full_name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">
            {post.author?.full_name ?? "Unknown"}
          </span>
          <span>·</span>
          <Clock className="size-3.5" />
          <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 shrink-0" />
          <span>
            <span className="font-medium text-foreground">
              {post.team_size_needed}
            </span>{" "}
            {post.team_size_needed === 1 ? "member" : "members"} needed
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <ContactIcon className="size-4 shrink-0" />
          <span>{CONTACT_LABELS[post.contact_preference]}</span>
        </div>

        {post.event && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>
              For:{" "}
              <Link
                href={`/events/${post.event.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {post.event.title}
              </Link>
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h2 className="font-semibold">About</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {post.description}
        </p>
      </div>

      {/* Required skills */}
      {post.required_skills.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Required skills</h2>
          <div className="flex flex-wrap gap-2">
            {post.required_skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        {isAuthor && (
          <ClosePostButton postId={post.id} isOpen={post.is_open} />
        )}

        {!isAuthor && post.is_open && isStudent && allowsDm && post.author && (
          <SendDmButton recipientId={post.author.id} />
        )}
      </div>

      {/* Suggested Teammates — only shown to the post author */}
      {isAuthor && post.required_skills.length > 0 && (
        <>
          <Separator />
          <SuggestedTeammates post={post} />
        </>
      )}

      <Separator />

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="font-semibold">
          Comments{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({comments.length})
          </span>
        </h2>

        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to reach out!
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="size-8 shrink-0 mt-0.5">
              <AvatarImage src={comment.author?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {comment.author?.full_name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">
                  {comment.author?.full_name ?? "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), "MMM d, yyyy · h:mm a")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {/* Comment form */}
        {post.is_open && allowsComment && (
          <div className="pt-2">
            <TeamCommentForm postId={post.id} />
          </div>
        )}

        {post.is_open && !allowsComment && !isAuthor && (
          <p className="text-sm text-muted-foreground italic">
            The author prefers to be contacted via DM only.
          </p>
        )}

        {!post.is_open && (
          <p className="text-sm text-muted-foreground italic">
            This listing is closed.
          </p>
        )}
      </div>
    </div>
  );
}
