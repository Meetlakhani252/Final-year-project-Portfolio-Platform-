"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EducationFormDialog } from "@/components/portfolio/education-form-dialog";
import { deleteEducation } from "@/actions/portfolio";
import type { Education } from "@/types/portfolio";

type DialogState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; education: Education };

export function EducationTab({ education }: { education: Education[] }) {
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDelete(id: string, institution: string) {
    if (!confirm(`Delete "${institution}"? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteEducation(id);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Education deleted");
    });
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Education</CardTitle>
          <CardDescription>
            Add your educational background and relevant coursework.
          </CardDescription>
        </div>
        <Button
          onClick={() => setDialog({ open: true, mode: "create" })}
          className="min-h-[44px]"
        >
          <Plus className="mr-2 size-4" />
          Add education
        </Button>
      </CardHeader>
      <CardContent>
        {education.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
            <GraduationCap className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No education yet</p>
              <p className="text-xs text-muted-foreground">
                Add your first education entry to showcase your academic
                background.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {education.map((edu) => (
              <li
                key={edu.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {edu.institution}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {edu.degree}
                    {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                  </p>
                  {(edu.start_date || edu.end_date) && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(edu.start_date) ?? "?"} –{" "}
                      {formatDate(edu.end_date) ?? "Present"}
                    </p>
                  )}
                  {edu.gpa != null && (
                    <p className="text-xs text-muted-foreground">
                      GPA: {edu.gpa.toFixed(2)}
                    </p>
                  )}
                  {edu.courses.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {edu.courses.map((course) => (
                        <span
                          key={course}
                          className="rounded-full border bg-muted px-2 py-0.5 text-[11px]"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit education"
                    onClick={() =>
                      setDialog({
                        open: true,
                        mode: "edit",
                        education: edu,
                      })
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete education"
                    disabled={isPending && deletingId === edu.id}
                    onClick={() => onDelete(edu.id, edu.institution)}
                  >
                    {isPending && deletingId === edu.id ? (
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
        <EducationFormDialog
          mode={{ kind: "create" }}
          open
          onOpenChange={(o) => !o && setDialog({ open: false })}
        />
      )}
      {dialog.open && dialog.mode === "edit" && (
        <EducationFormDialog
          key={dialog.education.id}
          mode={{ kind: "edit", education: dialog.education }}
          open
          onOpenChange={(o) => !o && setDialog({ open: false })}
        />
      )}
    </Card>
  );
}
