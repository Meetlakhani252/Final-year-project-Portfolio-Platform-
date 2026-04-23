import Link from "next/link";
import { Users, CalendarDays, MessageSquare, Mail, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import type { TeamPost } from "@/actions/teams";

const CONTACT_ICONS: Record<TeamPost["contact_preference"], React.ReactNode> = {
  dm: <Mail className="size-3.5" />,
  comment: <MessageSquare className="size-3.5" />,
  both: <MessagesSquare className="size-3.5" />,
};

const CONTACT_LABELS: Record<TeamPost["contact_preference"], string> = {
  dm: "DM only",
  comment: "Comment only",
  both: "DM or comment",
};

export function TeamPostCard({ post }: { post: TeamPost }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/teams/${post.id}`}
            className="font-semibold text-base leading-snug line-clamp-2 hover:underline"
          >
            {post.title}
          </Link>
          {!post.is_open && (
            <Badge variant="outline" className="shrink-0 text-muted-foreground">
              Filled
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
          <span className="font-medium text-foreground">
            {post.author?.full_name ?? "Unknown"}
          </span>
          <span>·</span>
          <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.description}
        </p>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0" />
            <span>
              {post.team_size_needed}{" "}
              {post.team_size_needed === 1 ? "member" : "members"} needed
            </span>
          </div>
          <div className="flex items-center gap-2">
            {CONTACT_ICONS[post.contact_preference]}
            <span>{CONTACT_LABELS[post.contact_preference]}</span>
          </div>
          {post.event && (
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 shrink-0" />
              <span className="truncate">
                For:{" "}
                <Link
                  href={`/events/${post.event.id}`}
                  className="text-foreground hover:underline"
                >
                  {post.event.title}
                </Link>
              </span>
            </div>
          )}
        </div>

        {post.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.required_skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {post.required_skills.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{post.required_skills.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          render={<Link href={`/teams/${post.id}`} />}
          variant="outline"
          size="sm"
          className="w-full"
        >
          View post
        </Button>
      </CardFooter>
    </Card>
  );
}
