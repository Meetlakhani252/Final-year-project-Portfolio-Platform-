"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectFormDialog } from "@/components/portfolio/project-form-dialog";
import { deleteProject } from "@/actions/portfolio";
import type { ProjectWithScreenshots } from "@/types/portfolio";

type DialogState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; project: ProjectWithScreenshots };

export function ProjectsTab({
  projects,
}: {
  projects: ProjectWithScreenshots[];
}) {
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDelete(id: string, title: string) {
    if (!confirm(`Delete project "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteProject(id);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Project deleted");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Showcase the work you want recruiters to see.
          </CardDescription>
        </div>
        <Button
          onClick={() => setDialog({ open: true, mode: "create" })}
          className="min-h-[44px]"
        >
          <Plus className="mr-2 size-4" />
          Add project
        </Button>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
            <FolderOpen className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No projects yet</p>
              <p className="text-xs text-muted-foreground">
                Add your first project to start building your portfolio.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {project.screenshots[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.screenshots[0].image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">
                    {project.title}
                  </p>
                  {project.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.tech_stack.slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="badge-stone text-[10px]"
                        >
                          {t}
                        </span>
                      ))}
                      {project.tech_stack.length > 6 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{project.tech_stack.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit project"
                    onClick={() =>
                      setDialog({ open: true, mode: "edit", project })
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete project"
                    disabled={isPending && deletingId === project.id}
                    onClick={() => onDelete(project.id, project.title)}
                  >
                    {isPending && deletingId === project.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {dialog.open && dialog.mode === "create" && (
        <ProjectFormDialog
          mode={{ kind: "create" }}
          open
          onOpenChange={(o) => !o && setDialog({ open: false })}
        />
      )}
      {dialog.open && dialog.mode === "edit" && (
        <ProjectFormDialog
          key={dialog.project.id}
          mode={{ kind: "edit", project: dialog.project }}
          open
          onOpenChange={(o) => !o && setDialog({ open: false })}
        />
      )}
    </Card>
  );
}
