"use client";

import { useEffect, useState } from "react";

interface SidebarSection {
  id: string;
  label: string;
}

export function ProfileSidebar({ sections }: { sections: SidebarSection[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="hidden lg:block w-44 shrink-0">
      <nav className="sticky top-8 space-y-0.5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
              activeId === id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}