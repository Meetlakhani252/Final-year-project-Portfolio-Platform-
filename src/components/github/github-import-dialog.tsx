"use client";

import { useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  Star,
  ExternalLink,
  CheckSquare,
  Square,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { importGithubRepos } from "@/actions/github";
import type { GitHubRepo } from "@/lib/github";

interface RepoWithLanguages extends GitHubRepo {
  techStack: string[];
}

interface ReposResponse {
  repos: GitHubRepo[];
  github_username: string;
}

async function fetchRepos(): Promise<ReposResponse> {
  const res = await fetch("/api/github/repos");
  if (!res.ok) throw new Error("Failed to fetch repositories");
  return res.json();
}

export function GitHubImportDialog() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isImporting, startImport] = useTransition();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["github-repos"],
    queryFn: fetchRepos,
    enabled: open,
    staleTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
  });

  const repos = (data?.repos ?? []).filter((r) => !r.fork && !r.archived);

  function toggleAll() {
    if (selected.size === repos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(repos.map((r) => r.id)));
    }
  }

  function toggleRepo(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleImport() {
    const toImport: Parameters<typeof importGithubRepos>[0] = repos
      .filter((r) => selected.has(r.id))
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        homepage: r.homepage,
        // Tech stack derived from primary language for simplicity;
        // full per-repo language fetch is in the languages endpoint
        techStack: r.language ? [r.language] : [],
      }));

    startImport(async () => {
      const result = await importGithubRepos(toImport);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const { imported, skipped } = result.data!;
      if (imported === 0 && skipped > 0) {
        toast.info("All selected repositories were already imported.");
      } else {
        toast.success(
          skipped > 0
            ? `Imported ${imported} project${imported !== 1 ? "s" : ""}. ${skipped} already existed.`
            : `Imported ${imported} project${imported !== 1 ? "s" : ""} successfully.`
        );
      }

      setOpen(false);
      setSelected(new Set());
    });
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setOpen(true)}
      >
        <Download className="size-4" />
        Import projects from GitHub
      </Button>

      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaGithub className="size-5" />
            Import GitHub Repositories
          </DialogTitle>
          <DialogDescription>
            Select repositories to import as portfolio projects. Forks and
            archived repos are hidden.
          </DialogDescription>
        </DialogHeader>

        {/* Repo list */}
        <div className="max-h-105 overflow-y-auto rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading repositories…
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <p>Failed to load repositories.</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 gap-1"
                onClick={() => refetch()}
              >
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            </div>
          ) : repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <FolderOpen className="size-8 opacity-40" />
              <p>No repositories found.</p>
            </div>
          ) : (
            <>
              {/* Select all header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2.5">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                >
                  {selected.size === repos.length ? (
                    <CheckSquare className="size-4 text-primary" />
                  ) : (
                    <Square className="size-4 text-muted-foreground" />
                  )}
                  {selected.size === repos.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {repos.length} repositories
                </span>
              </div>

              {repos.map((repo) => {
                const isSelected = selected.has(repo.id);
                return (
                  <button
                    key={repo.id}
                    onClick={() => toggleRepo(repo.id)}
                    className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Repo info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-sm">
                          {repo.name}
                        </span>
                        {repo.language && (
                          <Badge variant="secondary" className="text-xs py-0">
                            {repo.language}
                          </Badge>
                        )}
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="size-3" />
                            {repo.stargazers_count}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {repo.description}
                        </p>
                      )}
                    </div>

                    {/* External link */}
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label={`Open ${repo.name} on GitHub`}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </button>
                );
              })}
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {selected.size} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setSelected(new Set());
              }}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selected.size === 0 || isImporting || isLoading}
              className="gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Import {selected.size > 0 ? selected.size : ""} project
                  {selected.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
}
