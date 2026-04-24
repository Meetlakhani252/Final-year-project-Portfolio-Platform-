import Image from "next/image";
import Link from "next/link";
import { GraduationCap, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookmarkButton } from "./bookmark-button";
import { SendMessageButton } from "./send-message-button";
import type { StudentResult } from "@/actions/recruiter";

const AVAILABILITY_LABELS: Record<string, string> = {
  internship: "Internship",
  fulltime: "Full-time",
  research: "Research",
};

interface StudentCardProps {
  student: StudentResult;
  isBookmarked: boolean;
  onBookmarkToggle?: (bookmarked: boolean) => void;
}

export function StudentCard({ student, isBookmarked, onBookmarkToggle }: StudentCardProps) {
  const initials = student.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const topSkills = student.skills.slice(0, 5);
  const extraSkills = student.skills.length - topSkills.length;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {student.avatar_url ? (
              <Image
                src={student.avatar_url}
                alt={student.full_name}
                width={48}
                height={48}
                className="rounded-full object-cover size-12"
              />
            ) : (
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                {initials}
              </div>
            )}
          </div>

          {/* Name + bookmark */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold text-sm leading-tight line-clamp-1">
                {student.full_name}
              </p>
              <BookmarkButton
                studentId={student.id}
                initialBookmarked={isBookmarked}
                onToggle={onBookmarkToggle}
              />
            </div>

            {student.university && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{student.university}</span>
              </div>
            )}

            {student.program && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                <GraduationCap className="size-3 shrink-0" />
                <span className="truncate">{student.program}</span>
              </div>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {student.graduation_year && (
            <Badge variant="outline" className="text-xs">
              Class of {student.graduation_year}
            </Badge>
          )}
          {student.gpa_public && student.gpa !== null && (
            <Badge variant="outline" className="text-xs">
              GPA {Number(student.gpa).toFixed(2)}
            </Badge>
          )}
          {student.available_for.map((a) => (
            <Badge key={a} variant="secondary" className="text-xs">
              {AVAILABILITY_LABELS[a] ?? a}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {/* Top skills */}
      <CardContent className="flex-1 pb-3">
        {topSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill) => (
              <Badge key={skill} className="text-xs">
                {skill}
              </Badge>
            ))}
            {extraSkills > 0 && (
              <Badge variant="outline" className="text-xs">
                +{extraSkills}
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No skills listed</p>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="pt-0 gap-2">
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
          className="flex-1"
        >
          View Portfolio
        </Button>
        <div className="flex-1">
          <SendMessageButton recipientId={student.id} />
        </div>
      </CardFooter>
    </Card>
  );
}
