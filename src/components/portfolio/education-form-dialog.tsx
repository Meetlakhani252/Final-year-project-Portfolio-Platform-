"use client";

import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

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
import { addEducation, updateEducation } from "@/actions/portfolio";
import { educationSchema } from "@/validations/portfolio";
import type { Education } from "@/types/portfolio";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; education: Education };

export function EducationFormDialog({
  mode,
  open,
  onOpenChange,
}: {
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const existing = mode.kind === "edit" ? mode.education : null;

  const [institution, setInstitution] = useState(existing?.institution ?? "");
  const [degree, setDegree] = useState(existing?.degree ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(existing?.field_of_study ?? "");
  const [startDate, setStartDate] = useState(existing?.start_date ?? "");
  const [endDate, setEndDate] = useState(existing?.end_date ?? "");
  const [gpa, setGpa] = useState(existing?.gpa?.toString() ?? "");
  const [courses, setCourses] = useState<string[]>(existing?.courses ?? []);
  const [courseInput, setCourseInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function addCourse() {
    const trimmed = courseInput.trim();
    if (!trimmed) return;
    if (courses.includes(trimmed)) {
      toast.error("Course already added");
      return;
    }
    if (courses.length >= 30) {
      toast.error("At most 30 courses");
      return;
    }
    setCourses((prev) => [...prev, trimmed]);
    setCourseInput("");
  }

  function onCourseKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCourse();
    }
  }

  function removeCourse(course: string) {
    setCourses((prev) => prev.filter((c) => c !== course));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const input = {
      institution,
      degree,
      field_of_study: fieldOfStudy || undefined,
      start_date: startDate || null,
      end_date: endDate || null,
      gpa: gpa ? parseFloat(gpa) : null,
      courses,
    };

    const parsed = educationSchema.safeParse(input);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      const result =
        mode.kind === "create"
          ? await addEducation(parsed.data)
          : await updateEducation(mode.education.id, parsed.data);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        mode.kind === "create" ? "Education added" : "Education updated"
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode.kind === "create" ? "Add education" : "Edit education"}
          </DialogTitle>
          <DialogDescription>
            Add your educational background to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edu-institution">Institution *</Label>
            <Input
              id="edu-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Stanford University"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edu-degree">Degree *</Label>
            <Input
              id="edu-degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. Bachelor of Science"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edu-field">Field of study</Label>
            <Input
              id="edu-field"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edu-start">Start date</Label>
              <Input
                id="edu-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-end">End date</Label>
              <Input
                id="edu-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edu-gpa">GPA</Label>
            <Input
              id="edu-gpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="e.g. 3.85"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edu-course">Courses</Label>
            <div className="flex gap-2">
              <Input
                id="edu-course"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                onKeyDown={onCourseKeyDown}
                placeholder="Type a course and press Enter"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCourse}
                disabled={!courseInput.trim()}
              >
                Add
              </Button>
            </div>
            {courses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {courses.map((course) => (
                  <span
                    key={course}
                    className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => removeCourse(course)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
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
                "Add education"
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
