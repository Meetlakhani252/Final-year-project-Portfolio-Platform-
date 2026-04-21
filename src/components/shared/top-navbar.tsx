"use client";

import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";
import { MobileNav } from "@/components/shared/mobile-nav";
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

      <div className="flex items-center gap-1">
        {showMessages && (
          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-[44px] min-w-[44px]"
            render={<Link href="/messages" />}
          >
            <MessageSquare className="size-5" />
            <span className="sr-only">Messages</span>
          </Button>
        )}

        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-[44px] min-w-[44px]"
          >
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              0
            </span>
          </Button>
        )}

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
