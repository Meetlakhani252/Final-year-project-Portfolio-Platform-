"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SnapshotRow } from "@/app/u/[username]/journey/page";
import type { SnapshotData } from "@/lib/snapshots";

interface SnapshotDiff {
  projects: number;
  skills: number;
  certifications: number;
  education: number;
  blogPosts: number;
}

function computeDiff(
  current: SnapshotData,
  previous: SnapshotData | null
): SnapshotDiff | null {
  if (!previous) return null;
  return {
    projects: current.projects.length - previous.projects.length,
    skills: current.skills.length - previous.skills.length,
    certifications: current.certifications.length - previous.certifications.length,
    education: current.education.length - previous.education.length,
    blogPosts: current.blog_post_count - previous.blog_post_count,
  };
}

const TRIGGER_LABELS: Record<string, string> = {
  monthly: "Monthly",
  project_added: "Project Added",
  certification_added: "Certification Added",
  manual: "Manual",
};

const TRIGGER_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  monthly: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  project_added: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  certification_added: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  manual: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

function DiffBadge({ delta, label }: { delta: number; label: string }) {
  if (delta === 0) return null;
  const positive = delta > 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
        positive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
      }`}
    >
      {positive ? "+" : ""}
      {delta} {label}
    </span>
  );
}

function SnapshotCard({
  snapshot,
  diff,
  isFirst,
  isLast,
}: {
  snapshot: SnapshotRow;
  diff: SnapshotDiff | null;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const data = snapshot.snapshot_data;
  const color =
    TRIGGER_COLORS[snapshot.trigger_type] ?? TRIGGER_COLORS.manual;
  const label =
    TRIGGER_LABELS[snapshot.trigger_type] ?? snapshot.trigger_type;

  const date = new Date(snapshot.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const hasDiffs =
    diff &&
    (diff.projects !== 0 ||
      diff.skills !== 0 ||
      diff.certifications !== 0 ||
      diff.education !== 0 ||
      diff.blogPosts !== 0);

  return (
    <div className="relative flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`mt-1.5 size-3 shrink-0 rounded-full ${color.dot}`} />
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Card */}
      <div className={`mb-6 flex-1 ${isLast ? "" : ""}`}>
        <div className="rounded-lg border bg-card">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-2 p-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Trigger badge */}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}
                >
                  {label}
                </span>
                {isFirst && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Baseline
                  </span>
                )}
              </div>
              <p className="text-sm font-medium">
                {snapshot.trigger_description ?? label}
              </p>
              <p className="text-xs text-muted-foreground">
                {formattedDate} · {formattedTime}
              </p>
            </div>

            {/* Stats summary */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{data.projects.length} projects</span>
              <span>{data.skills.length} skills</span>
              <span>{data.certifications.length} certs</span>
              <span>{data.blog_post_count} posts</span>
            </div>
          </div>

          {/* Diff row */}
          {hasDiffs && (
            <div className="flex flex-wrap gap-1.5 border-t px-4 py-2.5">
              <DiffBadge delta={diff.projects} label="project" />
              <DiffBadge delta={diff.skills} label="skill" />
              <DiffBadge delta={diff.certifications} label="cert" />
              <DiffBadge delta={diff.education} label="education" />
              <DiffBadge delta={diff.blogPosts} label="post" />
            </div>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            <span>{expanded ? "Hide details" : "Show full details"}</span>
            {expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>

          {/* Expandable detail */}
          {expanded && (
            <div className="border-t px-4 py-4 space-y-4 text-sm">
              {/* Profile */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Profile
                </p>
                <p className="font-medium">{data.profile.full_name}</p>
                {(data.profile.university || data.profile.program) && (
                  <p className="text-xs text-muted-foreground">
                    {[data.profile.program, data.profile.university]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {data.profile.bio && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {data.profile.bio}
                  </p>
                )}
              </div>

              {/* Projects */}
              {data.projects.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Projects ({data.projects.length})
                  </p>
                  <ul className="space-y-1.5">
                    {data.projects.map((p, i) => (
                      <li key={i} className="space-y-0.5">
                        <p className="text-xs font-medium">{p.title}</p>
                        {p.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.tech_stack.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {data.skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Skills ({data.skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {data.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-muted px-1.5 py-0.5 text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {data.certifications.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Certifications ({data.certifications.length})
                  </p>
                  <ul className="space-y-0.5">
                    {data.certifications.map((c, i) => (
                      <li key={i} className="text-xs">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {c.issuer}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Education ({data.education.length})
                  </p>
                  <ul className="space-y-0.5">
                    {data.education.map((e, i) => (
                      <li key={i} className="text-xs">
                        <span className="font-medium">{e.institution}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {e.degree}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Blog posts */}
              {data.blog_post_count > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Blog Posts
                  </p>
                  <p className="mt-0.5 text-xs">
                    {data.blog_post_count} published post
                    {data.blog_post_count !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function JourneyTimeline({ snapshots }: { snapshots: SnapshotRow[] }) {
  // snapshots arrive oldest-first from the server; display newest-first
  const reversed = [...snapshots].reverse();

  return (
    <div>
      <p className="mb-6 text-xs text-muted-foreground">
        {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""} recorded
      </p>
      <div>
        {reversed.map((snapshot, i) => {
          // diff against the snapshot that came just before this one (older)
          const olderIndex = snapshots.length - 1 - i - 1;
          const olderSnapshot = olderIndex >= 0 ? snapshots[olderIndex] : null;
          const diff = computeDiff(
            snapshot.snapshot_data,
            olderSnapshot?.snapshot_data ?? null
          );

          return (
            <SnapshotCard
              key={snapshot.id}
              snapshot={snapshot}
              diff={diff}
              isFirst={i === reversed.length - 1}
              isLast={i === reversed.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}
