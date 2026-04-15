import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Link as LinkIcon } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

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
  github: FaGithub,
  linkedin: FaLinkedin,
  website: Globe,
  twitter: FaXTwitter,
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

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true });

  const { data: projects } = await supabase
    .from("projects")
    .select("*, screenshots:project_screenshots(*)")
    .eq("profile_id", profile.id)
    .order("display_order");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:py-16">
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

      {skills && skills.length > 0 && (
        <section className="space-y-4">
          <h2 className="heading-serif text-xl font-semibold tracking-tight">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span key={skill.id} className="badge-sage">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {projects && projects.length > 0 && (
        <section className="space-y-4">
          <h2 className="heading-serif text-xl font-semibold tracking-tight">
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <div className="flex items-center gap-3 text-xs">
                      {project.github_url && (
                        <Link
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <FaGithub className="size-3.5" />
                          GitHub
                        </Link>
                      )}
                      {project.live_url && (
                        <Link
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="size-3.5" />
                          Live
                        </Link>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {project.description}
                    </p>
                  )}

                  {project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech_stack.map((tech) => (
                        <span key={tech} className="badge-sage">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.screenshots.length > 0 && (
                    <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2">
                      {project.screenshots
                        .slice()
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((shot) => (
                          <div
                            key={shot.id}
                            className="relative aspect-video w-72 shrink-0 snap-start overflow-hidden rounded-md border bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shot.image_url}
                              alt={shot.alt_text ?? project.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
