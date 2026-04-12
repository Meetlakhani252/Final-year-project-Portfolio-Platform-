import { getUser } from "@/lib/get-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, MessagesSquare, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className="section-container space-y-8">
      <div>
        <h1 className="text-3xl">Welcome back, {user.fullName}</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your portfolio and activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              Get started
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
      </div>
    </div>
  );
}
