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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-11",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
