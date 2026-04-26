"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AboutForm } from "@/components/portfolio/about-form";
import { ProjectsTab } from "@/components/portfolio/projects-tab";
import { SkillsTab } from "@/components/portfolio/skills-tab";
import { CertificationsTab } from "@/components/portfolio/certifications-tab";
import { EducationTab } from "@/components/portfolio/education-tab";
import { BlogTab } from "@/components/portfolio/blog-tab";
import { PhotosTab } from "@/components/portfolio/photos-tab";
import { SocialLinksTab } from "@/components/portfolio/social-links-tab";
import type {
  Profile,
  ProjectWithScreenshots,
  Skill,
  Certification,
  Education,
  BlogPost,
  PortfolioPhoto,
  SocialLink,
} from "@/types/portfolio";

import { 
  User, 
  Briefcase, 
  Cpu, 
  Award, 
  GraduationCap, 
  FileText, 
  Image as ImageIcon, 
  Globe,
  Settings2
} from "lucide-react";

const SECTIONS = [
  { value: "about", label: "Identity", icon: User },
  { value: "projects", label: "Sequences", icon: Briefcase },
  { value: "skills", label: "Architecture", icon: Cpu },
  { value: "certifications", label: "Validations", icon: Award },
  { value: "education", label: "Foundations", icon: GraduationCap },
  { value: "blog", label: "Journal", icon: FileText },
  { value: "photos", label: "Galleries", icon: ImageIcon },
  { value: "social", label: "Network", icon: Globe },
] as const;

export function PortfolioEditTabs({
  profile,
  projects,
  skills,
  certifications,
  education,
  blogPosts,
  photos,
  socialLinks,
}: {
  profile: Profile;
  projects: ProjectWithScreenshots[];
  skills: Skill[];
  certifications: Certification[];
  education: Education[];
  blogPosts: BlogPost[];
  photos: PortfolioPhoto[];
  socialLinks: SocialLink[];
}) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "about";

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        {/* Horizontal Tab Bar */}
        <div className="glass-card mb-6 p-1 rounded-2xl border-primary/10 overflow-x-auto">
          <TabsList className="flex h-auto bg-transparent border-none p-1 gap-1 min-w-max">
            {SECTIONS.map((s) => (
              <TabsTrigger 
                key={s.value} 
                value={s.value}
                className="flex-1 justify-center gap-2 px-6 py-3 rounded-xl border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all hover:bg-white/5 group"
              >
                <s.icon className="size-4 opacity-50 group-data-[state=active]:opacity-100" />
                <span className="font-mono text-sm font-bold whitespace-nowrap">{s.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Workspace Content Area */}
        <Card className="glass-card border-primary/10 overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-transparent via-primary/30 to-transparent" />
          <CardContent className="p-6 md:p-10">
            <TabsContent value="about" className="mt-0">
              <AboutForm profile={profile} />
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              <ProjectsTab projects={projects} />
            </TabsContent>

            <TabsContent value="skills" className="mt-0">
              <SkillsTab skills={skills} />
            </TabsContent>

            <TabsContent value="certifications" className="mt-0">
              <CertificationsTab certifications={certifications} />
            </TabsContent>

            <TabsContent value="education" className="mt-0">
              <EducationTab education={education} />
            </TabsContent>

            <TabsContent value="blog" className="mt-0">
              <BlogTab posts={blogPosts} />
            </TabsContent>

            <TabsContent value="photos" className="mt-0">
              <PhotosTab photos={photos} />
            </TabsContent>

            <TabsContent value="social" className="mt-0">
              <SocialLinksTab socialLinks={socialLinks} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
