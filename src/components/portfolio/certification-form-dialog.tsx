"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import {
  addCertification,
  updateCertification,
} from "@/actions/portfolio";
import { certificationSchema } from "@/validations/portfolio";
import type { Certification } from "@/types/portfolio";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; certification: Certification };

export function CertificationFormDialog({
  mode,
  open,
  onOpenChange,
}: {
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const existing = mode.kind === "edit" ? mode.certification : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [issuer, setIssuer] = useState(existing?.issuer ?? "");
  const [issueDate, setIssueDate] = useState(existing?.issue_date ?? "");
  const [credentialUrl, setCredentialUrl] = useState(
    existing?.credential_url ?? ""
  );
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const input = {
      name,
      issuer,
      issue_date: issueDate || null,
      credential_url: credentialUrl || undefined,
    };

    const parsed = certificationSchema.safeParse(input);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      const result =
        mode.kind === "create"
          ? await addCertification(parsed.data)
          : await updateCertification(mode.certification.id, parsed.data);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        mode.kind === "create"
          ? "Certification added"
          : "Certification updated"
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode.kind === "create"
              ? "Add certification"
              : "Edit certification"}
          </DialogTitle>
          <DialogDescription>
            Add a certification, license, or credential to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cert-name">Name *</Label>
            <Input
              id="cert-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS Solutions Architect"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cert-issuer">Issuer *</Label>
            <Input
              id="cert-issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="e.g. Amazon Web Services"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cert-date">Issue date</Label>
            <Input
              id="cert-date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cert-url">Credential URL</Label>
            <Input
              id="cert-url"
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://..."
            />
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
                "Add certification"
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
