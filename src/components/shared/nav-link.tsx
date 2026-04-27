"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  MessagesSquare,
  Calendar,
  Users,
  Search,
  Bookmark,
  CalendarPlus,
  Building2,
  Rss,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, NavIconName } from "@/lib/nav-config";

const ICONS: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  portfolio: Briefcase,
  resume: FileText,
  forums: MessagesSquare,
  events: Calendar,
  teams: Users,
  discover: Search,
  bookmarks: Bookmark,
  messages: MessageSquare,
  "create-event": CalendarPlus,
  jobs: Building2,
  feed: Rss,
};

export function NavLink({
  item,
  collapsed = false,
  onClick,
}: {
  item: NavItem;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = ICONS[item.icon];

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-mono font-bold transition-all min-h-11 overflow-hidden",
        isActive
          ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]"
          : "text-muted-foreground hover:bg-white/5 hover:text-white"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
      )}
      <Icon className={cn(
        "size-5 shrink-0 transition-transform group-hover:scale-110",
        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
      )} />
      {!collapsed && <span className="relative z-10">{item.label}</span>}
      {isActive && !collapsed && (
        <div className="absolute right-3 size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      )}
    </Link>
  );
}
