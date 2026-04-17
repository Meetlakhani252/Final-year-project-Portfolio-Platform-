"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { X, Loader2, ChevronDown, ChevronRight, Code2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addSkill, removeSkill } from "@/actions/portfolio";
import { SKILL_CATEGORIES } from "@/lib/skills-catalog";
import type { Skill } from "@/types/portfolio";

export function SkillsTab({ skills }: { skills: Skill[] }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingName, setAddingName] = useState<string | null>(null);
  const [isAdding, startAddTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  const addedNames = new Set(skills.map((s) => s.name.toLowerCase()));

  function onAdd(name: string) {
    if (addedNames.has(name.toLowerCase())) {
      toast.error("Skill already added");
      return;
    }
    setAddingName(name);
    startAddTransition(async () => {
      const result = await addSkill(name);
      setAddingName(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${name} added`);
    });
  }

  function onRemove(id: string) {
    setRemovingId(id);
    startRemoveTransition(async () => {
      const result = await removeSkill(id);
      setRemovingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Skill removed");
    });
  }

  function toggleCategory(name: string) {
    setExpandedCategory((prev) => (prev === name ? null : name));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Select skills from categories below or remove existing ones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your skills
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const busy = isRemoving && removingId === skill.id;
                return (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 py-1 pl-3 pr-1 text-xs"
                  >
                    <span>{skill.name}</span>
                    {skill.source === "github" && (
                      <span
                        className="inline-flex items-center gap-0.5 text-muted-foreground"
                        title="Imported from GitHub"
                      >
                        <Code2 className="size-3" />
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${skill.name}`}
                      onClick={() => onRemove(skill.id)}
                      disabled={busy}
                      className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <X className="size-3" />
                      )}
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-1">
          {SKILL_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.name;
            return (
              <div key={category.name} className="rounded-md border">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <span>{category.name}</span>
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && (
                  <div className="flex flex-wrap gap-1.5 border-t px-3 py-3">
                    {category.skills.map((skillName) => {
                      const alreadyAdded = addedNames.has(
                        skillName.toLowerCase()
                      );
                      const busy = isAdding && addingName === skillName;
                      return (
                        <button
                          key={skillName}
                          type="button"
                          disabled={alreadyAdded || busy}
                          onClick={() => onAdd(skillName)}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
                            alreadyAdded
                              ? "border-primary/30 bg-primary/10 text-primary cursor-default"
                              : "hover:bg-muted hover:text-foreground text-muted-foreground cursor-pointer"
                          } disabled:opacity-70`}
                        >
                          {busy ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : alreadyAdded ? (
                            <Check className="size-3" />
                          ) : null}
                          {skillName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
