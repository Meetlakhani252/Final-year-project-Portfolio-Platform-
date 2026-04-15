"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AboutForm } from "@/components/portfolio/about-form";
import { ProjectsTab } from "@/components/portfolio/projects-tab";
import { SkillsTab } from "@/components/portfolio/skills-tab";
import type {
  Profile,
  ProjectWithScreenshots,
  Skill,
} from "@/types/portfolio";

const SECTIONS = [
  { value: "about", label: "About" },
  { value: "projects", label: "Projects" },
  { value: "skills", label: "Skills" },
  { value: "education", label: "Education" },
  { value: "social", label: "Social" },
] as const;

export function PortfolioEditTabs({
  profile,
  projects,
  skills,
}: {
  profile: Profile;
  projects: ProjectWithScreenshots[];
  skills: Skill[];
}) {
  return (
    <Tabs defaultValue="about" className="w-full">
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

      {SECTIONS.filter(
        (s) =>
          s.value !== "about" && s.value !== "projects" && s.value !== "skills"
      ).map((s) => (
        <TabsContent key={s.value} value={s.value} className="mt-6">
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            {s.label} section editor coming soon.
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
