import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Link as LinkIcon, Briefcase, Code2, AtSign } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 3600;
export const dynamicParams = true;

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

const PLATFORM_ICON = {
  github: Code2,
  linkedin: Briefcase,
  website: Globe,
  twitter: AtSign,
  other: LinkIcon,
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return {
    title: `@${username} — Portfolio`,
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profile.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <Avatar className="size-24">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-xl">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {profile.full_name}
              </h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {(profile.program || profile.university) && (
                <p className="text-sm">
                  {[profile.program, profile.university]
                    .filter(Boolean)
                    .join(" · ")}
                  {profile.graduation_year ? ` · ${profile.graduation_year}` : ""}
                </p>
              )}
              {profile.gpa_public && profile.gpa != null && (
                <p className="text-sm text-muted-foreground">
                  GPA: {profile.gpa.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm leading-relaxed text-foreground/90">
              {profile.bio}
            </p>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 border-t pt-4">
              {socialLinks.map((link) => {
                const Icon = PLATFORM_ICON[link.platform] ?? LinkIcon;
                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="inline-flex size-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
