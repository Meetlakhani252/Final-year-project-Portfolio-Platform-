"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AboutForm } from "@/components/portfolio/about-form";
import { ProjectsTab } from "@/components/portfolio/projects-tab";
import { SkillsTab } from "@/components/portfolio/skills-tab";
import { CertificationsTab } from "@/components/portfolio/certifications-tab";
import { EducationTab } from "@/components/portfolio/education-tab";
import { BlogTab } from "@/components/portfolio/blog-tab";
import { PhotosTab } from "@/components/portfolio/photos-tab";
import { SocialLinksTab } from "@/components/portfolio/social-links-tab";
import { SectionReorder } from "@/components/portfolio/section-reorder";
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

const SECTIONS = [
  { value: "about", label: "About" },
  { value: "projects", label: "Projects" },
  { value: "skills", label: "Skills" },
  { value: "certifications", label: "Certifications" },
  { value: "education", label: "Education" },
  { value: "blog", label: "Blog" },
  { value: "photos", label: "Photos" },
  { value: "social", label: "Social" },
  { value: "reorder", label: "Reorder" },
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
  sectionOrder,
}: {
  profile: Profile;
  projects: ProjectWithScreenshots[];
  skills: Skill[];
  certifications: Certification[];
  education: Education[];
  blogPosts: BlogPost[];
  photos: PortfolioPhoto[];
  socialLinks: SocialLink[];
  sectionOrder: string[];
}) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "about";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        {SECTIONS.map((s) => (
          <TabsTrigger key={s.value} value={s.value}>
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="about" className="mt-6">
        <AboutForm profile={profile} />
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <ProjectsTab projects={projects} />
      </TabsContent>

      <TabsContent value="skills" className="mt-6">
        <SkillsTab skills={skills} />
      </TabsContent>

      <TabsContent value="certifications" className="mt-6">
        <CertificationsTab certifications={certifications} />
      </TabsContent>

      <TabsContent value="education" className="mt-6">
        <EducationTab education={education} />
      </TabsContent>

      <TabsContent value="blog" className="mt-6">
        <BlogTab posts={blogPosts} />
      </TabsContent>

      <TabsContent value="photos" className="mt-6">
        <PhotosTab photos={photos} />
      </TabsContent>

      <TabsContent value="social" className="mt-6">
        <SocialLinksTab socialLinks={socialLinks} />
      </TabsContent>

      <TabsContent value="reorder" className="mt-6">
        <SectionReorder initialOrder={sectionOrder} />
      </TabsContent>
    </Tabs>
  );
}
