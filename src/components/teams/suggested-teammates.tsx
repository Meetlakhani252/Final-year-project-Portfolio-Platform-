import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMatchedStudents, type TeamPost } from "@/actions/teams";
import { SendDmButton } from "@/components/teams/send-dm-button";

export async function SuggestedTeammates({ post }: { post: TeamPost }) {
  const students = await getMatchedStudents(post.required_skills, post.profile_id);

  if (students.length === 0) return null;

  const allowsDm =
    post.contact_preference === "dm" || post.contact_preference === "both";

  const requiredLowered = post.required_skills.map((s) => s.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" />
        <h2 className="font-semibold">
          Suggested Teammates{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({students.length})
          </span>
        </h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Students ranked by how many required skills they match.
      </p>

      <div className="space-y-3">
        {students.map((student) => (
          <div
            key={student.profile_id}
            className="flex items-start gap-4 rounded-lg border bg-card p-4"
          >
            {/* Avatar + rank */}
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={student.avatar_url ?? undefined} />
              <AvatarFallback>{student.full_name[0]}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="font-medium text-sm leading-snug">
                  {student.full_name}
                </p>
                {student.university && (
                  <p className="text-xs text-muted-foreground">
                    {student.university}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {student.matching_skills.map((skill) => (
                  <Badge key={skill} variant="default" className="text-xs py-0">
                    {skill}
                  </Badge>
                ))}
                {student.total_skills > student.matching_skills.length && (
                  <Badge variant="secondary" className="text-xs py-0">
                    +{student.total_skills - student.matching_skills.length} more
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {student.matching_skills.length} of {requiredLowered.length}{" "}
                required{" "}
                {requiredLowered.length === 1 ? "skill" : "skills"} matched ·{" "}
                {student.total_skills} total{" "}
                {student.total_skills === 1 ? "skill" : "skills"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              {student.username && (
                <Button
                  render={
                    <Link
                      href={`/u/${student.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  variant="outline"
                  size="sm"
                >
                  Portfolio
                </Button>
              )}
              {allowsDm && (
                <SendDmButton recipientId={student.profile_id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
