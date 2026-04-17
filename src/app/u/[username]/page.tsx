import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Link as LinkIcon,
  Award,
  ExternalLink,
  GraduationCap,
  FileText,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 3600;
export const dynamicParams = true;

const DEFAULT_SECTION_ORDER = [
  "about",
  "skills",
  "projects",
  "certifications",
  "education",
  "blog",
  "photos",
  "social",
];

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

  const [
    { data: socialLinks },
    { data: skills },
    { data: certifications },
    { data: education },
    { data: blogPosts },
    { data: photos },
    { data: projects },
    { data: sectionOrderRow },
  ] = await Promise.all([
    supabase
      .from("social_links")
      .select("*")
      .eq("profile_id", profile.id),
    supabase
      .from("skills")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("certifications")
      .select("*")
      .eq("profile_id", profile.id)
      .order("display_order"),
    supabase
      .from("education")
      .select("*")
      .eq("profile_id", profile.id)
      .order("display_order"),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("portfolio_photos")
      .select("*")
      .eq("profile_id", profile.id)
      .order("display_order"),
    supabase
      .from("projects")
      .select("*, screenshots:project_screenshots(*)")
      .eq("profile_id", profile.id)
      .order("display_order"),
    supabase
      .from("portfolio_section_order")
      .select("section_order")
      .eq("profile_id", profile.id)
      .maybeSingle(),
  ]);

  const sectionOrder =
    sectionOrderRow?.section_order?.length === DEFAULT_SECTION_ORDER.length
      ? sectionOrderRow.section_order
      : DEFAULT_SECTION_ORDER;

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    about: () => (
      <Card key="about">
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
        </CardContent>
      </Card>
    ),

    social: () => {
      if (!socialLinks || socialLinks.length === 0) return null;
      return (
        <section key="social" className="space-y-4">
          <h2 className="heading-serif text-xl font-semibold tracking-tight">
            Connect
          </h2>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => {
              const Icon =
                PLATFORM_ICON[link.platform as keyof typeof PLATFORM_ICON] ??
                LinkIcon;
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
        </section>
      );
    },

    skills: () => {
      if (!skills || skills.length === 0) return null;
      return (
        <section key="skills" className="space-y-4">
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
      );
    },

    certifications: () => {
      if (!certifications || certifications.length === 0) return null;
      return (
        <section key="certifications" className="space-y-4">
          <h2 className="heading-serif text-xl font-semibold tracking-tight">
            Certifications
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-tight">
                      {cert.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cert.issuer}
                    </p>
                    {cert.issue_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(cert.issue_date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </p>
                    )}
                    {cert.credential_url && (
                      <Link
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View credential
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      );
    },

    education: () => {
      if (!education || education.length === 0) return null;
      return (
        <section key="education" className="space-y-4">
          <h2 className="heading-serif text-xl font-semibold tracking-tight">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <Card key={edu.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-tight">
                      {edu.institution}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {edu.degree}
                      {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                    </p>
                    {(edu.start_date || edu.end_date) && (
                      <p className="text-xs text-muted-foreground">
                        {edu.start_date
                          ? new Date(
                              edu.start_date + "T00:00:00"
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "?"}{" "}
                        –{" "}
                        {edu.end_date
                          ? new Date(
                              edu.end_date + "T00:00:00"
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Present"}
                      </p>
                    )}
                    {edu.gpa != null && (
                      <p className="text-xs text-muted-foreground">
                        GPA: {edu.gpa.toFixed(2)}
                      </p>
                    )}
                    {edu.courses.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {edu.courses.map((course) => (
                          <span key={course} className="badge-sage text-[11px]">
                            {course}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      );
    },

    projects: () => {
      if (!projects || projects.length === 0) return null;
      return (
        <section key="projects" className="space-y-4">
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
                        .sort(
                          (a: { display_order: number }, b: { display_order: number }) =>
                            a.display_order - b.display_order
                        )
                        .map((shot: { id: string; image_url: string; alt_text?: string | null }) => (
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
      );
    },

    blog: () => {
      if (!blogPosts || blogPosts.length === 0) return null;
      return (
        <section key="blog" className="space-y-4">
          <h2 className="heading-serif text-xl font-semibold tracking-tight">
            Blog
          </h2>
          <div className="space-y-3">
            {blogPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Link
                      href={`/u/${username}/blog/${post.slug}`}
                      className="text-sm font-medium leading-tight hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        post.published_at || post.created_at
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {post.content_plain && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {post.content_plain.slice(0, 200)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      );
    },

    photos: () => {
      if (!photos || photos.length === 0) return null;
      return (
        <section key="photos" className="space-y-4">
          <h2 className="heading-serif text-xl font-semibold tracking-tight">
            Photos
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.image_url}
                  alt={photo.alt_text ?? photo.caption ?? "Portfolio photo"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-white">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    },
  };

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:py-16">
      {sectionOrder.map((section) => {
        const renderer = sectionRenderers[section];
        if (!renderer) return null;
        return renderer();
      })}
    </main>
  );
}
