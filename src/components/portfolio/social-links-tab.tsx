"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Globe, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateSocialLinks } from "@/actions/portfolio";
import type { SocialLink } from "@/types/portfolio";

const PLATFORMS = [
  { key: "github" as const, label: "GitHub", icon: FaGithub, placeholder: "https://github.com/username" },
  { key: "linkedin" as const, label: "LinkedIn", icon: FaLinkedin, placeholder: "https://linkedin.com/in/username" },
  { key: "website" as const, label: "Website", icon: Globe, placeholder: "https://yoursite.com" },
  { key: "twitter" as const, label: "Twitter / X", icon: FaXTwitter, placeholder: "https://x.com/username" },
  { key: "other" as const, label: "Other", icon: LinkIcon, placeholder: "https://..." },
] as const;

export function SocialLinksTab({
  socialLinks,
}: {
  socialLinks: SocialLink[];
}) {
  const linkMap = new Map(socialLinks.map((l) => [l.platform, l.url]));

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(PLATFORMS.map((p) => [p.key, linkMap.get(p.key) ?? ""]))
  );
  const [isPending, startTransition] = useTransition();

  function handleChange(platform: string, url: string) {
    setValues((prev) => ({ ...prev, [platform]: url }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const links = PLATFORMS.map((p) => ({
        platform: p.key,
        url: values[p.key] ?? "",
      }));

      const result = await updateSocialLinks({ links });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Social links updated");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>
          Add links to your social profiles and website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.key} className="space-y-2">
                <Label
                  htmlFor={`social-${p.key}`}
                  className="flex items-center gap-2"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {p.label}
                </Label>
                <Input
                  id={`social-${p.key}`}
                  type="url"
                  value={values[p.key] ?? ""}
                  onChange={(e) => handleChange(p.key, e.target.value)}
                  placeholder={p.placeholder}
                />
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending} className="min-h-[44px]">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save links"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
