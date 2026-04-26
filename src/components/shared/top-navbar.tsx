"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";
import { MobileNav } from "@/components/shared/mobile-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/shared/global-search";
import type { NavItem } from "@/lib/nav-config";

interface TopNavbarProps {
  items: NavItem[];
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    username?: string | null;
  };
  showNotifications?: boolean;
  showMessages?: boolean;
}

export function TopNavbar({
  items,
  user,
  showNotifications = true,
  showMessages = true,
}: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
      <MobileNav items={items} />

      <div className="hidden lg:flex">
        <Logo href="/dashboard" />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="hidden sm:block mr-2">
          <GlobalSearch />
        </div>

        {showMessages && (
          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-11 min-w-11"
            render={<Link href="/messages" />}
          >
            <MessageSquare className="size-5" />
            <span className="sr-only">Messages</span>
          </Button>
        )}

        {showNotifications && <NotificationBell />}

        <UserMenu
          fullName={user.fullName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          username={user.username}
        />
      </div>
    </header>
  );
}
