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
import { RecruiterSubscribeButton } from "@/components/shared/recruiter-subscribe-button";
import { checkConnection } from "@/actions/connections";
import { checkRecruiterSubscription } from "@/actions/recruiter-subscriptions";
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
  "comments",
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
  comments: "Feedback",
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

  const isRecruiterProfile = profile.role === "recruiter";
  const viewerIsStudent = currentUser?.role === "student";

  const [isConnected, isSubscribed] = await Promise.all([
    !isRecruiterProfile && profile ? checkConnection(profile.id) : Promise.resolve(false),
    isRecruiterProfile && viewerIsStudent && profile
      ? checkRecruiterSubscription(profile.id)
      : Promise.resolve(false),
  ]);

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
                  {profile.gpa && profile.gpa >= 3.5 && (
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
                  {isRecruiterProfile && viewerIsStudent ? (
                    <RecruiterSubscribeButton
                      recruiterId={profile.id}
                      initialIsSubscribed={isSubscribed}
                      className="w-full sm:w-auto"
                    />
                  ) : !isRecruiterProfile && (
                    <ConnectButton
                      targetId={profile.id}
                      initialIsConnected={isConnected}
                      className="w-full sm:w-auto"
                    />
                  )}
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
        <section id="skills" className="space-y-4 h-full">
          <Card className="glass-card p-6 h-full border-primary/10 flex flex-col">
            <h2 className="font-mono text-lg font-bold tracking-tight text-primary flex items-center gap-2 mb-4">
              <Cpu className="size-5" /> &gt; Core Architecture
            </h2>
            <div className="space-y-4 flex-1">
              <div className="grid gap-3">
                {skills.slice(0, 4).map((skill, i) => (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-foreground/70 uppercase">{skill.name}</span>
                      <span className="text-primary">{90 - i * 5}%</span>
                    </div>
                    <Progress value={90 - i * 5} className="h-1 bg-primary/10" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {skills.slice(4).map((skill) => (
                  <span key={skill.id} className="badge-sage text-[9px]">
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
        <section id="certifications" className="space-y-4 h-full">
          <Card className="glass-card p-6 h-full border-primary/10 flex flex-col">
            <h2 className="font-mono text-lg font-bold tracking-tight text-primary flex items-center gap-2 mb-4">
              <Award className="size-5" /> &gt; Credentials
            </h2>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/5">
                  <div className="size-8 shrink-0 flex items-center justify-center rounded bg-primary/10">
                    <Award className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{cert.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{cert.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      );
    },

    education: () => {
      if (!education || education.length === 0) return null;
      return (
        <section id="education" className="space-y-4 h-full">
          <Card className="glass-card p-6 h-full border-primary/10 flex flex-col">
            <h2 className="font-mono text-lg font-bold tracking-tight text-primary flex items-center gap-2 mb-4">
              <GraduationCap className="size-5" /> &gt; Education
            </h2>
            <div className="space-y-4 flex-1">
              {education.slice(0, 2).map((edu) => (
                <div key={edu.id} className="space-y-1">
                  <p className="text-sm font-bold leading-tight line-clamp-1">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{edu.degree}</p>
                  <p className="text-[10px] font-mono text-primary/60">
                    {edu.end_date ? new Date(edu.end_date).getFullYear() : "Present"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
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
    comments: () => (
      <section id="comments" className="space-y-4">
        <h2 className="font-mono text-xl font-bold tracking-tight text-primary">
          &gt; Public Feedback
        </h2>
        <Card className="glass-card p-6">
          <CommentSection
            targetType="blog_post"
            targetId={profile.id}
            currentUserId={currentUser?.id ?? null}
            currentUserRole={currentUserRole}
            portfolioOwnerId={profile.id}
          />
        </Card>
      </section>
    ),
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
  }));  const stats = [
    { label: "Projects", value: projects?.length || 0, icon: Layers, color: "text-blue-400" },
    { label: "Skills", value: skills?.length || 0, icon: Code2, color: "text-emerald-400" },
    { label: "GPA", value: profile.gpa?.toFixed(2) || "N/A", icon: GraduationCap, color: "text-amber-400" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-16 space-y-8">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between mb-8">
        <BackButton />
        <div className="flex items-center gap-2">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Main Bento Grid — top header cards only */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-min md:auto-rows-[120px]">

        {/* About Section - Hero Card */}
        <div className="md:col-span-4 lg:col-span-8 lg:row-span-3">
          <Card className="glass-card h-full overflow-hidden border-primary/20 relative group hover:border-primary/40 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
            <div className="absolute -top-24 -right-24 size-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -left-24 size-64 bg-cyan-500/5 rounded-full blur-3xl opacity-50" />
            
            <CardContent className="h-full flex flex-col justify-center p-8 md:p-10 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <div className="absolute -inset-1 bg-linear-to-r from-primary to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                  <Avatar className="size-32 md:size-40 border-4 border-background relative shadow-2xl">
                    {profile.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
                    )}
                    <AvatarFallback className="text-4xl font-mono bg-slate-900 text-primary">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                        {profile.full_name}
                      </h1>
                      {profile.gpa && profile.gpa >= 3.5 && (
                        <div className="badge-sage flex items-center gap-1 py-1">
                          <Sparkles className="size-3" />
                          Excellence
                        </div>
                      )}
                    </div>
                    <p className="text-xl text-primary font-mono opacity-80">@{profile.username}</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="size-5 text-primary" />
                      {profile.program}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="size-5 text-primary" />
                      {profile.university}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                    <ConnectButton
                      targetId={profile.id}
                      initialIsConnected={isConnected}
                      className="rounded-full px-8"
                    />
                    <Button variant="outline" className="rounded-full border-primary/20 hover:bg-primary/10">
                      <FileText className="size-4 mr-2 text-primary" />
                      Resume.exe
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio Card */}
        <div className="md:col-span-2 lg:col-span-4 lg:row-span-2">
          <Card className="glass-card h-full p-6 border-primary/10 flex flex-col justify-between hover:bg-primary/5 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-primary/60 uppercase tracking-widest">
                <Terminal className="size-4" />
                <span>Bio / Mission</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 font-sans italic">
                &quot;{profile.bio || "No bio protocol found."}&quot;
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <Sparkles className="size-5 text-primary/20" />
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        {stats.map((stat, i) => (
          <div key={i} className="md:col-span-1 lg:col-span-2 lg:row-span-1">
            <Card className="glass-card h-full p-6 border-primary/10 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
              <stat.icon className={cn("size-6 mb-2 opacity-50 group-hover:opacity-100 transition-opacity", stat.color)} />
              <p className="text-2xl font-mono font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-tighter">{stat.label}</p>
            </Card>
          </div>
        ))}

        {/* Social / Connect Card */}
        <div className="md:col-span-1 lg:col-span-2 lg:row-span-1">
          <Card className="glass-card h-full p-4 border-primary/10 flex flex-wrap gap-2 items-center justify-center">
            {socialLinks?.slice(0, 4).map((link) => {
              const Icon = PLATFORM_ICON[link.platform as keyof typeof PLATFORM_ICON] ?? LinkIcon;
              return (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  className="size-10 flex items-center justify-center rounded-lg bg-primary/5 border border-primary/10 text-muted-foreground hover:text-primary hover:border-primary transition-all"
                >
                  <Icon className="size-5" />
                </Link>
              );
            })}
            {!socialLinks?.length && <p className="text-[10px] font-mono text-muted-foreground uppercase">No Links</p>}
          </Card>
        </div>

        {/* Skills Section */}
        <div className="md:col-span-2 lg:col-span-4 lg:row-span-2">
          {sectionRenderers.skills()}
        </div>

        {/* Education Section */}
        <div className="md:col-span-2 lg:col-span-4 lg:row-span-2">
          {sectionRenderers.education()}
        </div>

        {/* Certifications Card */}
        <div className="md:col-span-2 lg:col-span-4 lg:row-span-2 overflow-y-auto">
          {sectionRenderers.certifications()}
        </div>
      </div>

      {/* Variable-height sections — outside bento grid to prevent overflow overlap */}
      <div className="space-y-8">
        {/* Projects - Full Width */}
        {sectionRenderers.projects()}

        {/* Blog + Photos side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {sectionRenderers.blog()}
          </div>
          <div className="lg:col-span-4">
            {sectionRenderers.photos()}
          </div>
        </div>

        {/* Comments / Feedback */}
        {sectionRenderers.comments()}

        {/* Journey Link */}
        <div className="pt-4 pb-24 text-center">
          <Link
            href={`/u/${username}/journey`}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full glass-card text-sm font-mono text-primary transition-all hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:border-primary/50 group"
          >
            <History className="size-5 transition-transform group-hover:rotate-180 duration-700" />
            <span className="tracking-widest uppercase">Decipher Historical Journey</span>
          </Link>
        </div>
      </div>

      {/* Floating Navigation (Mobile/Desktop) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full glass-card border-primary/20 flex items-center gap-8 shadow-2xl backdrop-blur-xl">
        {activeSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-[10px] font-mono font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            {section.label}
          </a>
        ))}
      </nav>
    </div>
  );
}