import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectScreenshot =
  Database["public"]["Tables"]["project_screenshots"]["Row"];
export type Skill = Database["public"]["Tables"]["skills"]["Row"];
export type Certification =
  Database["public"]["Tables"]["certifications"]["Row"];
export type Education = Database["public"]["Tables"]["education"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type PortfolioPhoto =
  Database["public"]["Tables"]["portfolio_photos"]["Row"];

export type ProjectWithScreenshots = Project & {
  screenshots: ProjectScreenshot[];
};

export type PortfolioAbout = Pick<
  Profile,
  | "id"
  | "username"
  | "full_name"
  | "avatar_url"
  | "bio"
  | "university"
  | "program"
  | "graduation_year"
  | "gpa"
  | "gpa_public"
>;

export type PortfolioData = {
  profile: Profile;
  social_links: SocialLink[];
};
