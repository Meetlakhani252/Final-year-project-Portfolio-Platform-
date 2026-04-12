"use client";

import { PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/shared/nav-link";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

export function DesktopSidebar({ items }: { items: NavItem[] }) {
  const open = useUIStore((s) => s.sidebarOpen);
  const toggle = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-sidebar transition-[width] duration-200",
        open ? "w-60" : "w-16"
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="min-h-[44px] min-w-[44px]"
        >
          {open ? (
            <PanelLeftClose className="size-5" />
          ) : (
            <PanelLeft className="size-5" />
          )}
          <span className="sr-only">
            {open ? "Collapse sidebar" : "Expand sidebar"}
          </span>
        </Button>
      </div>
      <nav className="flex flex-col gap-1 px-2 pb-4">
        {items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={!open} />
        ))}
      </nav>
    </aside>
  );
}
