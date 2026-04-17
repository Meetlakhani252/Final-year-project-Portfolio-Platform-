import type { Database } from "@/types/database";

// ─── Resume data types ────────────────────────────────────────────────────────

export type ResumeTemplate = "classic" | "modern";

export interface ResumePersonal {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ResumeEducationItem {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

export interface ResumeProjectItem {
  title: string;
  description: string;
  tech_stack: string[];
  url: string;
}

export interface ResumeCertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  template: ResumeTemplate;
  personal: ResumePersonal;
  summary: string;
  education: ResumeEducationItem[];
  skills: string[];
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
}

// ─── Portfolio → Resume mapper ────────────────────────────────────────────────

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Skill = Database["public"]["Tables"]["skills"]["Row"];
type Certification = Database["public"]["Tables"]["certifications"]["Row"];
type Education = Database["public"]["Tables"]["education"]["Row"];
type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

export interface PortfolioDataForResume {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  education: Education[];
  socialLinks: SocialLink[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function mapPortfolioToResume(
  portfolio: PortfolioDataForResume
): ResumeData {
  const github =
    portfolio.socialLinks.find((l) => l.platform === "github")?.url ?? "";
  const linkedin =
    portfolio.socialLinks.find((l) => l.platform === "linkedin")?.url ?? "";
  const website =
    portfolio.socialLinks.find((l) => l.platform === "website")?.url ?? "";

  return {
    template: "classic",
    personal: {
      full_name: portfolio.profile.full_name,
      email: portfolio.profile.email,
      phone: "",
      location: "",
      website,
      linkedin,
      github,
    },
    summary: portfolio.profile.bio ?? "",
    education: portfolio.education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field_of_study: e.field_of_study ?? "",
      start_date: formatDate(e.start_date),
      end_date: e.end_date ? formatDate(e.end_date) : "Present",
    })),
    skills: portfolio.skills.map((s) => s.name),
    projects: portfolio.projects.map((p) => ({
      title: p.title,
      description: p.description ?? "",
      tech_stack: p.tech_stack,
      url: p.live_url ?? p.github_url ?? "",
    })),
    certifications: portfolio.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      date: formatDate(c.issue_date),
    })),
  };
}
