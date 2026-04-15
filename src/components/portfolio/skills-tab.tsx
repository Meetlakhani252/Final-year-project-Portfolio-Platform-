"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Plus, X, Loader2, Code2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addSkill, removeSkill } from "@/actions/portfolio";
import type { Skill } from "@/types/portfolio";

export function SkillsTab({ skills }: { skills: Skill[] }) {
  const [value, setValue] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isAdding, startAddTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  function submit() {
    const name = value.trim();
    if (!name) return;

    const duplicate = skills.some(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      toast.error("Skill already added");
      return;
    }

    startAddTransition(async () => {
      const result = await addSkill(name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setValue("");
      toast.success("Skill added");
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add skills as tags. Press Enter or click add.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. TypeScript"
            maxLength={50}
            disabled={isAdding}
            className="min-h-[44px]"
          />
          <Button
            type="button"
            onClick={submit}
            disabled={isAdding || !value.trim()}
            className="min-h-[44px]"
          >
            {isAdding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add
          </Button>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No skills yet. Add your first skill above.
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
