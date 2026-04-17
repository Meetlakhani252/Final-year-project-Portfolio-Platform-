"use client";

import { useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Check, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addGithubSkills } from "@/actions/github";

interface LanguagesResponse {
  languages: Record<string, number>;
  suggestions: string[];
}

async function fetchLanguages(): Promise<LanguagesResponse> {
  const res = await fetch("/api/github/languages");
  if (!res.ok) throw new Error("Failed to fetch language data");
  return res.json();
}

interface GitHubSkillSuggestionsProps {
  /** Skills the user already has — pre-filtered server-side but we also
   *  check client-side to handle skills added in the same session. */
  existingSkills: string[];
}

export function GitHubSkillSuggestions({
  existingSkills,
}: GitHubSkillSuggestionsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [isAdding, startAdd] = useTransition();

  const existingSet = new Set(existingSkills.map((s) => s.toLowerCase()));

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["github-languages"],
    queryFn: fetchLanguages,
    staleTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
  });

  // Filter to skills not already owned and not dismissed
  const suggestions = (data?.suggestions ?? []).filter(
    (s) => !existingSet.has(s.toLowerCase()) && !dismissed.has(s)
  );

  function toggleConfirm(skill: string) {
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  }

  function dismissSkill(skill: string) {
    setConfirmed((prev) => {
      const next = new Set(prev);
      next.delete(skill);
      return next;
    });
    setDismissed((prev) => new Set([...prev, skill]));
  }

  function handleAddSkills() {
    const toAdd = [...confirmed];
    if (toAdd.length === 0) return;

    startAdd(async () => {
      const result = await addGithubSkills(toAdd);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const { added, skipped } = result.data!;

      // Mark confirmed skills as "existing" by dismissing them
      setDismissed((prev) => new Set([...prev, ...toAdd]));
      setConfirmed(new Set());

      if (added > 0) {
        toast.success(
          `Added ${added} skill${added !== 1 ? "s" : ""} to your profile.`
        );
      } else if (skipped > 0) {
        toast.info("Those skills were already on your profile.");
      }
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Skill Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="size-4 animate-spin" />
            Analyzing your repositories…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Skill Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Failed to load suggestions.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => refetch()}
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Skill Suggestions
          </CardTitle>
          <CardDescription>
            {(data?.suggestions ?? []).length === 0
              ? "No recognizable languages found in your repositories."
              : "All suggested skills are already on your profile."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          Skill Suggestions from GitHub
        </CardTitle>
        <CardDescription>
          Based on your repository languages. Click to confirm, or dismiss what
          you don&apos;t want.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skill chips */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((skill) => {
            const isConfirmed = confirmed.has(skill);
            return (
              <div key={skill} className="flex items-center">
                <button
                  onClick={() => toggleConfirm(skill)}
                  className={`flex items-center gap-1 rounded-l-full border py-1 pl-3 pr-2 text-sm transition-colors ${
                    isConfirmed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  {isConfirmed && <Check className="size-3" />}
                  {skill}
                </button>
                <button
                  onClick={() => dismissSkill(skill)}
                  className="flex items-center rounded-r-full border border-l-0 border-border bg-background px-1.5 py-1 text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Dismiss ${skill}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {confirmed.size > 0
              ? `${confirmed.size} skill${confirmed.size !== 1 ? "s" : ""} selected`
              : "Click a skill to select it"}
          </p>
          <Button
            size="sm"
            onClick={handleAddSkills}
            disabled={confirmed.size === 0 || isAdding}
            className="gap-2"
          >
            {isAdding ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Add {confirmed.size > 0 ? confirmed.size : ""} skill
                {confirmed.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
