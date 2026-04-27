"use client";

import type { ResumeData, ResumeEducationItem, ResumeProjectItem, ResumeCertificationItem } from "@/lib/pdf";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Props {
  value: ResumeData;
  onChange: (data: ResumeData) => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-semibold tracking-tight">{children}</h3>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function TemplateSelector({
  value,
  onChange,
}: {
  value: "classic" | "modern";
  onChange: (t: "classic" | "modern") => void;
}) {
  return (
    <div className="space-y-3">
      <SectionHeading>Template</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {(["classic", "modern"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`rounded-lg border-2 p-3 text-left transition-colors ${
              value === t
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <p className="text-sm font-medium capitalize">{t}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t === "classic"
                ? "Single column, ATS-friendly"
                : "Sidebar accent, modern look"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonalSection({
  value,
  onChange,
}: {
  value: ResumeData["personal"];
  onChange: (p: ResumeData["personal"]) => void;
}) {
  const set = (key: keyof ResumeData["personal"]) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.target.value });

  return (
    <div className="space-y-3">
      <SectionHeading>Personal Info</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name">
          <Input value={value.full_name} onChange={set("full_name")} placeholder="Jane Smith" />
        </Field>
        <Field label="Email">
          <Input value={value.email} onChange={set("email")} placeholder="jane@example.com" />
        </Field>
        <Field label="Phone">
          <Input value={value.phone} onChange={set("phone")} placeholder="+1 555-0000" />
        </Field>
        <Field label="Location">
          <Input value={value.location} onChange={set("location")} placeholder="New York, NY" />
        </Field>
        <Field label="GitHub">
          <Input value={value.github} onChange={set("github")} placeholder="github.com/jane" />
        </Field>
        <Field label="LinkedIn">
          <Input value={value.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/jane" />
        </Field>
        <Field label="Website" >
          <Input value={value.website} onChange={set("website")} placeholder="janesmith.dev" />
        </Field>
      </div>
    </div>
  );
}

function SummarySection({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionHeading>Summary</SectionHeading>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A brief professional summary…"
        className="min-h-20 resize-y"
      />
    </div>
  );
}

function EducationSection({
  value,
  onChange,
}: {
  value: ResumeEducationItem[];
  onChange: (items: ResumeEducationItem[]) => void;
}) {
  const update = (i: number, key: keyof ResumeEducationItem, v: string) => {
    const next = value.map((item, idx) => (idx === i ? { ...item, [key]: v } : item));
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([
      ...value,
      { institution: "", degree: "", field_of_study: "", start_date: "", end_date: "" },
    ]);

  return (
    <div className="space-y-3">
      <SectionHeading>Education</SectionHeading>
      {value.map((e, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-muted-foreground">Entry {i + 1}</p>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Remove education entry ${i + 1}`} onClick={() => remove(i)}>
              <X className="size-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Institution">
              <Input value={e.institution} onChange={(ev) => update(i, "institution", ev.target.value)} placeholder="MIT" />
            </Field>
            <Field label="Degree">
              <Input value={e.degree} onChange={(ev) => update(i, "degree", ev.target.value)} placeholder="BSc Computer Science" />
            </Field>
            <Field label="Field of study">
              <Input value={e.field_of_study} onChange={(ev) => update(i, "field_of_study", ev.target.value)} placeholder="Software Engineering" />
            </Field>
            <div />
            <Field label="Start date">
              <Input value={e.start_date} onChange={(ev) => update(i, "start_date", ev.target.value)} placeholder="Sep 2020" />
            </Field>
            <Field label="End date">
              <Input value={e.end_date} onChange={(ev) => update(i, "end_date", ev.target.value)} placeholder="May 2024 or Present" />
            </Field>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="size-3.5" /> Add education
      </Button>
    </div>
  );
}

function SkillsSection({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = (e.target as HTMLInputElement).value.trim();
      if (v && !value.includes(v)) {
        onChange([...value, v]);
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      <SectionHeading>Skills</SectionHeading>
      <div className="flex flex-wrap gap-1.5 rounded-md border min-h-10 p-2">
        {value.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"
          >
            {s}
            <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-foreground">
              <X className="size-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "Type a skill and press Enter…" : "Add more…"}
          className="flex-1 min-w-30 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-[10px] text-muted-foreground">Press Enter or comma to add a skill</p>
    </div>
  );
}

function ProjectsSection({
  value,
  onChange,
}: {
  value: ResumeProjectItem[];
  onChange: (items: ResumeProjectItem[]) => void;
}) {
  const update = (i: number, key: keyof ResumeProjectItem, v: string | string[]) => {
    onChange(value.map((item, idx) => (idx === i ? { ...item, [key]: v } : item)));
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...value, { title: "", description: "", tech_stack: [], url: "" }]);

  return (
    <div className="space-y-3">
      <SectionHeading>Projects</SectionHeading>
      {value.map((p, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-muted-foreground">Project {i + 1}</p>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Remove project ${i + 1}`} onClick={() => remove(i)}>
              <X className="size-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Title">
              <Input value={p.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="My App" />
            </Field>
            <Field label="URL (optional)">
              <Input value={p.url} onChange={(e) => update(i, "url", e.target.value)} placeholder="github.com/…" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={p.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="What does it do?"
              className="min-h-14 resize-y"
            />
          </Field>
          <Field label="Tech stack (comma-separated)">
            <Input
              value={p.tech_stack.join(", ")}
              onChange={(e) =>
                update(
                  i,
                  "tech_stack",
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                )
              }
              placeholder="React, TypeScript, Node.js"
            />
          </Field>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="size-3.5" /> Add project
      </Button>
    </div>
  );
}

function CertificationsSection({
  value,
  onChange,
}: {
  value: ResumeCertificationItem[];
  onChange: (items: ResumeCertificationItem[]) => void;
}) {
  const update = (i: number, key: keyof ResumeCertificationItem, v: string) =>
    onChange(value.map((item, idx) => (idx === i ? { ...item, [key]: v } : item)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { name: "", issuer: "", date: "" }]);

  return (
    <div className="space-y-3">
      <SectionHeading>Certifications</SectionHeading>
      {value.map((c, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-muted-foreground">Cert {i + 1}</p>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Remove certification ${i + 1}`} onClick={() => remove(i)}>
              <X className="size-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Name">
              <Input value={c.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="AWS Developer" />
            </Field>
            <Field label="Issuer">
              <Input value={c.issuer} onChange={(e) => update(i, "issuer", e.target.value)} placeholder="Amazon" />
            </Field>
            <Field label="Date">
              <Input value={c.date} onChange={(e) => update(i, "date", e.target.value)} placeholder="Jan 2023" />
            </Field>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="size-3.5" /> Add certification
      </Button>
    </div>
  );
}

export function ResumeForm({ value, onChange }: Props) {
  const set =
    <K extends keyof ResumeData>(key: K) =>
    (v: ResumeData[K]) =>
      onChange({ ...value, [key]: v });

  return (
    <div className="space-y-8">
      <TemplateSelector value={value.template} onChange={set("template")} />
      <PersonalSection value={value.personal} onChange={set("personal")} />
      <SummarySection value={value.summary} onChange={set("summary")} />
      <EducationSection value={value.education} onChange={set("education")} />
      <SkillsSection value={value.skills} onChange={set("skills")} />
      <ProjectsSection value={value.projects} onChange={set("projects")} />
      <CertificationsSection value={value.certifications} onChange={set("certifications")} />
    </div>
  );
}
