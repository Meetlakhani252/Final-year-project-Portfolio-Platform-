export type NavIconName =
  | "dashboard"
  | "portfolio"
  | "resume"
  | "forums"
  | "events"
  | "teams"
  | "discover"
  | "bookmarks"
  | "messages"
  | "create-event";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
}

export const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Portfolio", href: "/portfolio/edit", icon: "portfolio" },
  { label: "Resume", href: "/resume", icon: "resume" },
  { label: "Forums", href: "/forums", icon: "forums" },
  { label: "Events", href: "/events", icon: "events" },
  { label: "Teams", href: "/teams", icon: "teams" },
];

export const RECRUITER_NAV: NavItem[] = [
  { label: "Discover", href: "/discover", icon: "discover" },
  { label: "Bookmarks", href: "/bookmarks", icon: "bookmarks" },
  { label: "Messages", href: "/messages", icon: "messages" },
];

export const ORGANIZER_NAV: NavItem[] = [
  { label: "My Events", href: "/events", icon: "events" },
  { label: "Create Event", href: "/events/create", icon: "create-event" },
];
