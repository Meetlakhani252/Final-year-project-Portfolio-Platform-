export const PLATFORM_NAME =
  process.env.NEXT_PUBLIC_PLATFORM_NAME || "StudentPortfolio";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// User roles
export const ROLES = {
  STUDENT: "student",
  RECRUITER: "recruiter",
  ORGANIZER: "organizer",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Route protection
// Routes that require authentication but are accessible to any role
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/notifications",
  "/settings",
];

// Role-specific routes
export const STUDENT_ROUTES = [
  "/portfolio/edit",
  "/resume",
  "/forums",
  "/messages",
  "/teams",
];

export const RECRUITER_ROUTES = ["/discover", "/bookmarks"];

export const ORGANIZER_ROUTES = ["/events/create"];

export const PUBLIC_ROUTES = ["/", "/login", "/signup", "/u"];

// Forum categories
export const FORUM_CATEGORIES = [
  { name: "Hackathons & Competitions", slug: "hackathons-competitions" },
  { name: "Internships & Jobs", slug: "internships-jobs" },
  { name: "Course Help", slug: "course-help" },
  { name: "Research & Projects", slug: "research-projects" },
  { name: "General", slug: "general" },
] as const;

// Portfolio sections (default order)
export const DEFAULT_SECTION_ORDER = [
  "about",
  "projects",
  "skills",
  "certifications",
  "education",
  "blog",
  "photos",
  "social_links",
] as const;

// File upload limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Polling intervals (ms)
export const POLL_INTERVAL_MESSAGES = 10_000; // 10s when conversation open
export const POLL_INTERVAL_UNREAD = 30_000; // 30s for unread counts
export const POLL_INTERVAL_NOTIFICATIONS = 30_000; // 30s for notifications

// Pagination
export const PAGE_SIZE_THREADS = 20;
export const PAGE_SIZE_REPLIES = 50;
export const PAGE_SIZE_DISCOVER = 20;

// Theme
export const THEME = {
  colors: {
    primary: "#4D7C5F",       // sage-500
    primaryLight: "#6EBF8B",  // sage for dark mode
    accent: "#D97706",        // amber-500
    accentLight: "#FBBF24",   // amber for dark mode
  },
  fonts: {
    sans: "Inter",
    serif: "Lora",
  },
} as const;
