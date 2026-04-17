"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Award, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CertificationFormDialog } from "@/components/portfolio/certification-form-dialog";
import { deleteCertification } from "@/actions/portfolio";
import type { Certification } from "@/types/portfolio";

type DialogState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; certification: Certification };

export function CertificationsTab({
  certifications,
}: {
  certifications: Certification[];
}) {
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCertification(id);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Certification deleted");
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
          <CardTitle>Certifications</CardTitle>
          <CardDescription>
            Add certifications, licenses, and credentials.
          </CardDescription>
        </div>
        <Button
          onClick={() => setDialog({ open: true, mode: "create" })}
          className="min-h-[44px]"
        >
          <Plus className="mr-2 size-4" />
          Add certification
        </Button>
      </CardHeader>
      <CardContent>
        {certifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
            <Award className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No certifications yet</p>
              <p className="text-xs text-muted-foreground">
                Add your first certification to showcase your credentials.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {certifications.map((cert) => (
              <li
                key={cert.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                  {cert.issue_date && (
                    <p className="text-xs text-muted-foreground">
                      Issued {formatDate(cert.issue_date)}
                    </p>
                  )}
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View credential
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit certification"
                    onClick={() =>
                      setDialog({
                        open: true,
                        mode: "edit",
                        certification: cert,
                      })
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete certification"
                    disabled={isPending && deletingId === cert.id}
                    onClick={() => onDelete(cert.id, cert.name)}
                  >
                    {isPending && deletingId === cert.id ? (
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
        <CertificationFormDialog
          mode={{ kind: "create" }}
          open
          onOpenChange={(o) => !o && setDialog({ open: false })}
        />
      )}
      {dialog.open && dialog.mode === "edit" && (
        <CertificationFormDialog
          key={dialog.certification.id}
          mode={{ kind: "edit", certification: dialog.certification }}
          open
          onOpenChange={(o) => !o && setDialog({ open: false })}
        />
      )}
    </Card>
  );
}
