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
      <div className="section-container space-y-8">
        <div>
          <h1 className="text-3xl">Welcome back, {user.fullName}</h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s an overview of your recruiting activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Discover Talent</CardTitle>
              <Search className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse student portfolios and find candidates that match your needs.
              </CardDescription>
              <Button render={<Link href="/discover" />} variant="outline" size="sm" className="mt-3">
                Browse portfolios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
              <Bookmark className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review candidates you&apos;ve saved for later.
              </CardDescription>
              <Button render={<Link href="/bookmarks" />} variant="outline" size="sm" className="mt-3">
                View bookmarks
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect directly with students you&apos;re interested in.
              </CardDescription>
              <Button render={<Link href="/messages" />} variant="outline" size="sm" className="mt-3">
                Open messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role === "organizer") {
    return (
      <div className="section-container space-y-8">
        <div>
          <h1 className="text-3xl">Welcome back, {user.fullName}</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your events and connect with students.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Events</CardTitle>
              <CalendarDays className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and manage your published events and hackathons.
              </CardDescription>
              <Button render={<Link href="/events" />} variant="outline" size="sm" className="mt-3">
                View events
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Create Event</CardTitle>
              <PlusCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set up a new hackathon, competition, or networking event.
              </CardDescription>
              <Button render={<Link href="/events/create" />} variant="outline" size="sm" className="mt-3">
                Create event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Student dashboard
  return (
    <div className="section-container space-y-8">
      <div>
        <h1 className="text-3xl">Welcome back, {user.fullName}</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your portfolio and activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <Briefcase className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Build your portfolio to showcase your work.
            </CardDescription>
            <Button render={<Link href="/portfolio/edit" />} variant="outline" size="sm" className="mt-3">
              Edit portfolio
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resume</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create a professional resume from your portfolio.
            </CardDescription>
            <Button render={<Link href="/resume" />} variant="outline" size="sm" className="mt-3">
              Create resume
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Forums</CardTitle>
            <MessagesSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Join discussions with fellow students.
            </CardDescription>
            <Button render={<Link href="/forums" />} variant="outline" size="sm" className="mt-3">
              Browse forums
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Find teammates for hackathons and projects.
            </CardDescription>
            <Button render={<Link href="/teams" />} variant="outline" size="sm" className="mt-3">
              Find teams
            </Button>
          </CardContent>
        </Card>

        {user.username && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Public Profile</CardTitle>
              <Globe className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                See your portfolio as recruiters and visitors see it.
              </CardDescription>
              <Button render={<Link href={`/u/${user.username}`} target="_blank" />} variant="outline" size="sm" className="mt-3">
                View public profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
