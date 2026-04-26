import { getUser } from "@/lib/get-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  MessagesSquare,
  Users,
  Search,
  Bookmark,
  MessageCircle,
  Globe,
  CalendarDays,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getUser();

  if (user.role === "recruiter") {
    return (
      <div className="section-container space-y-8 py-10">
        <div className="space-y-2">
          <h1 className="font-mono text-4xl font-bold tracking-tight text-foreground">
            <span className="text-primary">System:</span> Welcome, {user.username || user.fullName}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Talent acquisition portal active. Ready to discover high-caliber candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card md:col-span-2 md:row-span-2 flex flex-col justify-between">
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-4 border border-primary/20">
                <Search className="size-6 text-primary" />
              </div>
              <CardTitle className="font-mono text-2xl">Discover Talent</CardTitle>
              <CardDescription className="text-base mt-2">
                Our advanced search engine allows you to browse student portfolios, filter by specific tech stacks, and find the perfect match for your upcoming roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/discover" />} size="lg" className="w-full sm:w-auto shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                Initialize Search
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-lg">Bookmarks</CardTitle>
              <Bookmark className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review candidates you&apos;ve saved for future evaluation.
              </CardDescription>
              <Button render={<Link href="/bookmarks" />} variant="ghost" size="sm" className="mt-4 text-primary hover:text-primary hover:bg-primary/10">
                Access Vault &rarr;
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-lg">Messages</CardTitle>
              <MessageCircle className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Direct encrypted communication lines with selected talent.
              </CardDescription>
              <Button render={<Link href="/messages" />} variant="ghost" size="sm" className="mt-4 text-primary hover:text-primary hover:bg-primary/10">
                Open Channels &rarr;
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role === "organizer") {
    return (
      <div className="section-container space-y-8 py-10">
        <div className="space-y-2">
          <h1 className="font-mono text-4xl font-bold tracking-tight text-foreground">
            <span className="text-primary">Admin:</span> Hello, {user.username || user.fullName}
          </h1>
          <p className="text-muted-foreground">
            Event coordination module initialized. Manage your hackathons and competitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
               <CalendarDays className="size-32" />
            </div>
            <CardHeader>
              <CardTitle className="font-mono text-2xl">Manage Events</CardTitle>
              <CardDescription className="text-base mt-2">
                Monitor registrations, update schedules, and broadcast announcements to all participants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/events" />} size="lg" className="shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                Go to Events
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-dashed border-primary/30 hover:border-primary transition-all bg-primary/5">
            <CardHeader className="flex flex-col items-center justify-center text-center py-12">
              <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <PlusCircle className="size-8 text-primary" />
              </div>
              <CardTitle className="font-mono text-2xl">New Competition</CardTitle>
              <CardDescription className="text-base mt-2">
                Launch a new hackathon or networking event to connect students.
              </CardDescription>
              <Button render={<Link href="/events/create" />} variant="outline" size="lg" className="mt-6 border-primary text-primary hover:bg-primary/10">
                Create Event Pipeline
              </Button>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Student dashboard - Bento Grid
  return (
    <div className="section-container space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="font-mono text-4xl font-bold tracking-tight text-foreground">
          <span className="text-primary">User:</span> {user.username || user.fullName}
        </h1>
        <p className="text-muted-foreground">
          Academic & Professional sequence in progress. Track your growth here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
        {/* Large Main Card - Portfolio */}
        <Card className="glass-card md:col-span-2 md:row-span-2 flex flex-col justify-between group overflow-hidden">
          <div className="absolute -bottom-10 -right-10 p-8 opacity-10 transition-transform group-hover:scale-110">
               <Briefcase className="size-48" />
          </div>
          <CardHeader>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-4 border border-primary/20">
              <Briefcase className="size-6 text-primary" />
            </div>
            <CardTitle className="font-mono text-3xl">Professional Portfolio</CardTitle>
            <CardDescription className="text-base mt-2 max-w-sm">
              Your digital identity. Showcase projects, experience, and academic excellence to the world.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Button render={<Link href="/portfolio/edit" />} size="lg" className="shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              Edit Data Sequence
            </Button>
          </CardContent>
        </Card>

        {/* Small Card - Resume */}
        <Card className="glass-card md:col-span-1 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-lg">Resume</CardTitle>
            <FileText className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Auto-generate PDF from your portfolio data.
            </CardDescription>
            <Button render={<Link href="/resume" />} variant="ghost" size="sm" className="mt-4 p-0 text-primary hover:bg-transparent hover:underline">
              Generate Now &rarr;
            </Button>
          </CardContent>
        </Card>

        {/* Small Card - Forums */}
        <Card className="glass-card md:col-span-1 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-lg">Forums</CardTitle>
            <MessagesSquare className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Peer-to-peer knowledge transfer and discussion.
            </CardDescription>
            <Button render={<Link href="/forums" />} variant="ghost" size="sm" className="mt-4 p-0 text-primary hover:bg-transparent hover:underline">
              Join Intel &rarr;
            </Button>
          </CardContent>
        </Card>

        {/* Wide Card - Teams & Profile */}
        <Card className="glass-card md:col-span-2 flex flex-row items-center justify-between group">
          <CardHeader>
            <CardTitle className="font-mono text-xl flex items-center gap-3">
              <Users className="size-5 text-primary" /> Team Formation
            </CardTitle>
            <CardDescription>
              Find collaborators for your next big project.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button render={<Link href="/teams" />} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              Find Teams
            </Button>
          </CardContent>
        </Card>

        {user.username && (
          <Card className="glass-card md:col-span-2 flex flex-row items-center justify-between group">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <Globe className="size-5 text-primary" /> Public Profile
              </CardTitle>
              <CardDescription>
                Live preview of your professional presence.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button render={<Link href={`/u/${user.username}`} target="_blank" />} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                View Live
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

