"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2, Unlink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { disconnectGitHub } from "@/actions/github";
import { GitHubImportDialog } from "@/components/github/github-import-dialog";
import { GitHubSkillSuggestions } from "@/components/github/github-skill-suggestions";

interface GitHubConnectSectionProps {
  userId: string;
  connectUrl: string; // pre-built GitHub OAuth URL (includes state=userId)
  connection: {
    github_username: string;
    last_synced_at: string | null;
  } | null;
  /** Skills the user already has, so we can exclude them from suggestions */
  existingSkills: string[];
}

export function GitHubConnectSection({
  userId,
  connectUrl,
  connection,
  existingSkills,
}: GitHubConnectSectionProps) {
  const [isDisconnecting, startDisconnect] = useTransition();

  function handleDisconnect() {
    startDisconnect(async () => {
      const result = await disconnectGitHub();
      if (result.ok) {
        toast.success("GitHub disconnected.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Connection status card */}
      <div className="rounded-lg border p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <FaGithub className="size-5" />
            </div>
            <div>
              <p className="font-medium text-sm">GitHub</p>
              {connection ? (
                <p className="text-xs text-muted-foreground">
                  Connected as{" "}
                  <span className="font-medium text-foreground">
                    @{connection.github_username}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Not connected</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connection ? (
              <>
                <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle2 className="size-3" />
                  Connected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {isDisconnecting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Unlink className="size-4" />
                  )}
                  {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                render={<a href={connectUrl} />}
              >
                <FaGithub className="size-4" />
                Connect GitHub
              </Button>
            )}
          </div>
        </div>

        {connection && (
          <p className="mt-3 text-xs text-muted-foreground">
            Connect GitHub to import your repositories as projects and get skill
            suggestions based on your code.
          </p>
        )}

        {!connection && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
            Connect your GitHub account to import repositories as portfolio
            projects and auto-suggest skills from your code.
          </div>
        )}
      </div>

      {/* Import & skill sections — only show when connected */}
      {connection && (
        <div className="space-y-4">
          <GitHubImportDialog />
          <GitHubSkillSuggestions existingSkills={existingSkills} />
        </div>
      )}
    </div>
  );
}
