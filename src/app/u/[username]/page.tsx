import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Link as LinkIcon,
  Award,
  ExternalLink,
  GraduationCap,
  FileText,
  History,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/portfolio/back-button";
import { ProfileSidebar } from "@/components/portfolio/profile-sidebar";
import { CommentSection } from "@/components/portfolio/comment-section";
import { SendMessageButton } from "@/components/recruiter/send-message-button";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Code2,
  Cpu,
  Terminal,
  Layers,
  Sparkles
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@/components/shared/connect-button";
import { checkConnection } from "@/actions/connections";
import { getUser } from "@/lib/get-user";

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

const SECTION_LABELS: Record<string, string> = {
  about: "About",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  education: "Education",
  blog: "Blog",
  photos: "Photos",
  social: "Connect",
};

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

  // Fetch current viewer
  const currentUser = await getUser().catch(() => null);
  const isConnected = profile ? await checkConnection(profile.id) : false;

  let currentUserRole: string | null = null;
  if (currentUser) {
    currentUserRole = currentUser.role;
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
      <div id="about">
        <Card className="glass-card overflow-hidden border-primary/20 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
          <div className="absolute -top-24 -right-24 size-64 bg-primary/5 rounded-full blur-3xl" />
          <CardContent className="space-y-6 p-8 relative">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <Avatar className="size-32 border-2 border-background relative">
                  {profile.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  )}
                  <AvatarFallback className="text-3xl font-mono bg-slate-900 text-primary">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-mono text-4xl font-bold tracking-tighter text-foreground">
                    {profile.full_name}
                  </h1>
                  {profile.gpa >= 3.5 && (
                    <div className="badge-sage flex items-center gap-1 py-1">
                      <Sparkles className="size-3" />
                      Academic Excellence
                    </div>
                  )}
                </div>
                <p className="text-lg text-primary font-mono opacity-80">@{profile.username}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="size-4 text-primary" />
                    {profile.program}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="size-4 text-primary" />
                    {profile.university}
                  </div>
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <Terminal className="absolute top-2 right-2 size-4 text-primary/20" />
                <p className="text-sm leading-relaxed text-foreground/90 font-sans italic">
                  &quot;{profile.bio}&quot;
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              {currentUser && currentUser.id !== profile.id && (
                <>
                  <ConnectButton
                    targetId={profile.id}
                    initialIsConnected={isConnected}
                    className="w-full sm:w-auto"
                  />
                  <SendMessageButton
                    recipientId={profile.id}
                    className="w-full sm:w-auto shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  />
                </>
              )}
              <Button variant="outline" className="w-full sm:w-auto border-primary/20 hover:bg-primary/10">
                <FileText className="size-4 mr-2 text-primary" />
                Download Protocol (Resume)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    ),

    social: () => {
      if (!socialLinks || socialLinks.length === 0) return null;
      return (
        <section id="social" className="space-y-4">
          <h2 className="font-mono text-xl font-bold tracking-tight text-primary">
            &gt; Connect
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
        <section id="skills" className="space-y-4">
          <h2 className="font-mono text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Cpu className="size-5" /> &gt; Core Architecture
          </h2>
          <Card className="glass-card p-6">
            <div className="space-y-6">
              {/* Visual Proficiency bars for top 3 skills, then badges */}
              <div className="grid gap-4">
                {skills.slice(0, 3).map((skill, i) => (
                  <div key={skill.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-foreground">{skill.name}</span>
                      <span className="text-primary">{85 - i * 5}%</span>
                    </div>
                    <Progress value={85 - i * 5} className="h-1.5 bg-primary/10" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {skills.slice(3).map((skill) => (
                  <span key={skill.id} className="badge-sage">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </section>
      );
    },

    certifications: () => {
      if (!certifications || certifications.length === 0) return null;
      return (
        <section id="certifications" className="space-y-4">
          <h2 className="font-mono text-xl font-bold tracking-tight text-primary">
            &gt; Certifications
          </h2>
          <div className="grid gap-3">
            {certifications.map((cert) => (
              <Card key={cert.id} className="glass-card border-primary/10 hover:border-primary/30">
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
        <section id="education" className="space-y-4">
          <h2 className="font-mono text-xl font-bold tracking-tight text-primary">
            &gt; Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <Card key={edu.id} className="glass-card border-primary/10 hover:border-primary/30">
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
        <section id="projects" className="space-y-4">
          <h2 className="font-mono text-xl font-bold tracking-tight text-primary">
            &gt; Projects
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="glass-card border-primary/20 hover:border-primary/40 overflow-hidden">
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

                  <CommentSection
                    targetType="project"
                    targetId={project.id}
                    currentUserId={currentUser?.id ?? null}
                    currentUserRole={currentUserRole}
                    portfolioOwnerId={profile.id}
                  />
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
        <section id="blog" className="space-y-4">
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
        <section id="photos" className="space-y-4">
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
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-foreground">
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

  // Pre-compute which sections render (have content) for sidebar + dividers
  const renderedSections: Array<{ id: string; element: React.ReactNode }> = [];
  for (const section of sectionOrder) {
    const renderer = sectionRenderers[section];
    if (!renderer) continue;
    const element = renderer();
    if (element) renderedSections.push({ id: section, element });
  }

  const activeSections = renderedSections.map(({ id }) => ({
    id,
    label: SECTION_LABELS[id] ?? id,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12 space-y-10">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-4">
          {/* Quick Stats Bar */}
          <div className="hidden md:flex gap-6 px-6 py-3 glass-card rounded-full border-primary/10">
            <div className="text-center">
              <p className="text-[10px] uppercase font-mono text-muted-foreground">Sequences</p>
              <p className="text-sm font-mono font-bold text-primary">{projects?.length || 0}</p>
            </div>
            <Separator orientation="vertical" className="h-8 bg-primary/20" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-mono text-muted-foreground">Skills</p>
              <p className="text-sm font-mono font-bold text-primary">{skills?.length || 0}</p>
            </div>
            <Separator orientation="vertical" className="h-8 bg-primary/20" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-mono text-muted-foreground">GPA</p>
              <p className="text-sm font-mono font-bold text-primary">{profile.gpa?.toFixed(2) || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="sticky top-24">
            <ProfileSidebar sections={activeSections} />
            <Card className="glass-card mt-6 p-4 border-dashed border-primary/30">
              <p className="text-xs font-mono text-muted-foreground text-center">
                Profile Status: <span className="text-primary font-bold">Optimized</span>
              </p>
            </Card>
          </div>
        </aside>

        {/* Right Column - Master Bento Grid */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
          {renderedSections.map(({ id, element }) => (
            <div
              key={id}
              className={cn(
                id === "about" ? "md:col-span-12 lg:col-span-8" :
                  id === "social" ? "md:col-span-6 lg:col-span-4" :
                    id === "skills" ? "md:col-span-6 lg:col-span-5" :
                      id === "education" ? "md:col-span-6 lg:col-span-7" :
                        id === "projects" || id === "comments" ? "md:col-span-12" :
                          "md:col-span-6"
              )}
            >
              {element}
            </div>
          ))}

          {/* Journey link */}
          <div className="md:col-span-12 py-12 text-center border-t border-primary/10 mt-10">
            <Link
              href={`/u/${username}/journey`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass-card text-sm font-mono text-primary transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:border-primary/50 group"
            >
              <History className="size-5 transition-transform group-hover:rotate-180 duration-500" />
              Access Historical Journey Log
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}