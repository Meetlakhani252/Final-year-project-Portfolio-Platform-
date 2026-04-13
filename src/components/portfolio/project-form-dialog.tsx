"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, X, ImagePlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addProject, updateProject } from "@/actions/portfolio";
import {
  MAX_SCREENSHOTS_PER_PROJECT,
  projectSchema,
} from "@/validations/portfolio";
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import type { ProjectWithScreenshots } from "@/types/portfolio";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; project: ProjectWithScreenshots };

export function ProjectFormDialog({
  mode,
  open,
  onOpenChange,
}: {
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const existing = mode.kind === "edit" ? mode.project : null;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [techStack, setTechStack] = useState<string[]>(
    existing?.tech_stack ?? []
  );
  const [techInput, setTechInput] = useState("");
  const [githubUrl, setGithubUrl] = useState(existing?.github_url ?? "");
  const [liveUrl, setLiveUrl] = useState(existing?.live_url ?? "");

  const [keptScreenshots, setKeptScreenshots] = useState(
    existing?.screenshots ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();

  const totalScreenshots = keptScreenshots.length + newFiles.length;

  function addTech() {
    const val = techInput.trim().replace(/,$/, "");
    if (!val) return;
    if (techStack.includes(val)) {
      setTechInput("");
      return;
    }
    if (techStack.length >= 20) {
      toast.error("At most 20 technologies");
      return;
    }
    setTechStack([...techStack, val]);
    setTechInput("");
  }

  function onTechKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTech();
    } else if (e.key === "Backspace" && techInput === "" && techStack.length) {
      setTechStack(techStack.slice(0, -1));
    }
  }

  function removeTech(name: string) {
    setTechStack(techStack.filter((t) => t !== name));
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const accepted: File[] = [];
    for (const f of files) {
      if (f.size > MAX_IMAGE_SIZE) {
        toast.error(`${f.name}: must be less than 5MB`);
        continue;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
        toast.error(`${f.name}: unsupported format`);
        continue;
      }
      accepted.push(f);
    }

    const remaining = MAX_SCREENSHOTS_PER_PROJECT - totalScreenshots;
    if (accepted.length > remaining) {
      toast.error(
        `At most ${MAX_SCREENSHOTS_PER_PROJECT} screenshots per project`
      );
      accepted.splice(remaining);
    }

    setNewFiles([...newFiles, ...accepted]);
    setNewPreviews([
      ...newPreviews,
      ...accepted.map((f) => URL.createObjectURL(f)),
    ]);
  }

  function removeKeptScreenshot(id: string) {
    setKeptScreenshots(keptScreenshots.filter((s) => s.id !== id));
  }

  function removeNewFile(index: number) {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(newFiles.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  }

  function resetForm() {
    newPreviews.forEach((u) => URL.revokeObjectURL(u));
    setTitle("");
    setDescription("");
    setTechStack([]);
    setTechInput("");
    setGithubUrl("");
    setLiveUrl("");
    setKeptScreenshots([]);
    setNewFiles([]);
    setNewPreviews([]);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = projectSchema.safeParse({
      title,
      description,
      tech_stack: techStack,
      github_url: githubUrl,
      live_url: liveUrl,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    const formData = new FormData();
    formData.set("title", parsed.data.title);
    formData.set("description", parsed.data.description);
    formData.set("github_url", parsed.data.github_url);
    formData.set("live_url", parsed.data.live_url);
    parsed.data.tech_stack.forEach((t) => formData.append("tech_stack", t));
    keptScreenshots.forEach((s) =>
      formData.append("keep_screenshot_ids", s.id)
    );
    newFiles.forEach((f) => formData.append("screenshots", f));

    startTransition(async () => {
      const result =
        mode.kind === "create"
          ? await addProject(formData)
          : await updateProject(mode.project.id, formData);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        mode.kind === "create" ? "Project added" : "Project updated"
      );
      if (mode.kind === "create") resetForm();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode.kind === "create" ? "Add project" : "Edit project"}
          </DialogTitle>
          <DialogDescription>
            Showcase a project on your public portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-title">Title *</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does it do, your role, impact…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-tech">Tech stack</Label>
            <div className="flex flex-wrap items-center gap-2 rounded-md border px-2 py-2 focus-within:ring-2 focus-within:ring-ring/50">
              {techStack.map((t) => (
                <span key={t} className="badge-sage inline-flex items-center gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTech(t)}
                    className="rounded-full hover:bg-black/10"
                    aria-label={`Remove ${t}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                id="project-tech"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={onTechKeyDown}
                onBlur={addTech}
                placeholder={techStack.length ? "" : "React, TypeScript…"}
                className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add. {techStack.length}/20
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-github">GitHub URL</Label>
              <Input
                id="project-github"
                type="url"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-live">Live URL</Label>
              <Input
                id="project-live"
                type="url"
                placeholder="https://..."
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Screenshots ({totalScreenshots}/{MAX_SCREENSHOTS_PER_PROJECT})
              </Label>
              {totalScreenshots < MAX_SCREENSHOTS_PER_PROJECT && (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted">
                  <ImagePlus className="size-3.5" />
                  Add images
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                  />
                </label>
              )}
            </div>
            {totalScreenshots === 0 ? (
              <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                No screenshots yet. Up to {MAX_SCREENSHOTS_PER_PROJECT}, max 5MB
                each.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {keptScreenshots.map((s) => (
                  <div
                    key={s.id}
                    className="group relative aspect-video overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image_url}
                      alt={s.alt_text ?? ""}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeKeptScreenshot(s.id)}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove screenshot"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {newPreviews.map((url, i) => (
                  <div
                    key={url}
                    className="group relative aspect-video overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove screenshot"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-h-[44px]">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : mode.kind === "create" ? (
                "Add project"
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
