"use client";

import { useTheme } from "next-themes";
import { Monitor, Sun, Moon, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-3 opacity-50">
        <div className="h-10 w-full bg-primary/5 rounded-lg border border-primary/10 animate-pulse" />
      </div>
    );
  }

  const themes = [
    {
      id: "dark",
      name: "Cyber Dark (Innovator)",
      icon: Moon,
      color: "bg-cyan-500",
      glow: "shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    },
    {
      id: "light",
      name: "Warm Earth (Linen)",
      icon: Sun,
      color: "bg-[#7D5A44]",
      glow: "shadow-[0_0_8px_rgba(125,90,68,0.4)]",
    },
  ];

  return (
    <div className="space-y-2">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group",
            theme === t.id
              ? "bg-primary/10 border-primary/30"
              : "bg-transparent border-white/5 hover:bg-white/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("size-3 rounded-full", t.color, theme === t.id && t.glow)} />
            <div className="text-left">
              <p className={cn(
                "text-sm font-mono font-bold",
                theme === t.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {t.name}
              </p>
            </div>
          </div>
          {theme === t.id && <Check className="size-4 text-primary animate-in zoom-in duration-300" />}
        </button>
      ))}
      <div className="pt-2 px-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
           Mode: {theme === 'dark' ? 'Digital Protocol' : 'Analog Heritage'}
        </p>
      </div>
    </div>
  );
}
