import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGitHubAuthUrl } from "@/lib/github";
import { FaGithub } from "react-icons/fa";
import { 
  Shield, 
  Eye, 
  Settings2, 
  Download, 
  Trash2, 
  Lock, 
  Bell, 
  Monitor,
  Check
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GitHubConnectSection } from "@/components/github/github-connect-section";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UsernameForm } from "@/components/settings/username-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch GitHub connection (if any)
  const { data: githubConnection } = await supabase
    .from("github_connections")
    .select("github_username, last_synced_at")
    .eq("profile_id", user.id)
    .single();

  // Fetch existing skills so the suggestion panel can exclude them
  const { data: skillsData } = await supabase
    .from("skills")
    .select("name")
    .eq("profile_id", user.id);

  const existingSkills = (skillsData ?? []).map((s) => s.name);

  // Build the GitHub OAuth URL server-side (includes client_id from env)
  const connectUrl = getGitHubAuthUrl(user.id);

  return (
    <div className="mx-auto max-w-4xl py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="font-mono text-4xl font-bold tracking-tight text-foreground">
          <span className="text-primary">Config:</span> Platform Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account protocols, integrations, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* Identity Module */}
        <Card className="glass-card md:col-span-6">
          <CardHeader>
            <CardTitle className="font-mono text-2xl flex items-center gap-3">
              <Eye className="size-6 text-primary" /> Account Identity
            </CardTitle>
            <CardDescription className="text-base">
              Set your unique platform identifier. Consists of your first name and 3 random numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-md">
            <UsernameForm initialUsername={user.user_metadata?.username || ""} />
          </CardContent>
        </Card>
        {/* GitHub Integration - Major Module */}
        <Card className="glass-card md:col-span-4 md:row-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-2xl flex items-center gap-3">
              <FaGithub className="size-6 text-primary" /> GitHub Integration
            </CardTitle>
            <CardDescription className="text-base">
              Synchronize your development activity and initialize skill discovery protocols.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GitHubConnectSection
              userId={user.id}
              connectUrl={connectUrl}
              connection={githubConnection ?? null}
              existingSkills={existingSkills}
            />
          </CardContent>
        </Card>

        {/* Privacy Module */}
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Shield className="size-5 text-primary" /> Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Public Profile</p>
                <p className="text-xs text-muted-foreground">Visible to recruiters</p>
              </div>
              <Switch checked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Show GPA</p>
                <p className="text-xs text-muted-foreground">In public portfolio</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Module */}
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Bell className="size-5 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Email Alerts</p>
              <Switch checked />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Direct Messages</p>
              <Switch checked />
            </div>
          </CardContent>
        </Card>


        {/* System & Theme */}
        <Card className="glass-card md:col-span-3">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Monitor className="size-5 text-primary" /> Visual Protocol
            </CardTitle>
            <CardDescription className="text-xs">
              Toggle between Digital and Analog workspace interfaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Advanced Controls */}
        <Card className="glass-card md:col-span-3">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Settings2 className="size-5 text-primary" /> Advanced Data
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="font-mono text-xs border-primary/20 hover:bg-primary/10">
              <Download className="size-3 mr-2" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" className="font-mono text-xs border-destructive/20 text-destructive hover:bg-destructive/10">
              <Trash2 className="size-3 mr-2" /> Purge Cache
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
