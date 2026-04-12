import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/shared/logo";
import { PLATFORM_NAME } from "@/lib/constants";
import {
  Briefcase,
  FileText,
  MessagesSquare,
  Users,
  Search,
  Calendar,
} from "lucide-react";

const FEATURES = [
  {
    icon: Briefcase,
    title: "Build Your Portfolio",
    description:
      "Showcase projects, skills, certifications, and more in a beautiful, customizable portfolio.",
  },
  {
    icon: FileText,
    title: "Generate Your Resume",
    description:
      "Auto-generate a professional resume from your portfolio data — always up to date.",
  },
  {
    icon: MessagesSquare,
    title: "Community Forums",
    description:
      "Discuss hackathons, internships, courses, and research with fellow grad students.",
  },
  {
    icon: Users,
    title: "Find Teammates",
    description:
      "Form teams for hackathons, competitions, and group projects.",
  },
  {
    icon: Search,
    title: "Get Discovered",
    description:
      "Recruiters can browse portfolios and connect with students who match their needs.",
  },
  {
    icon: Calendar,
    title: "Events & Hackathons",
    description:
      "Discover and organize events, hackathons, and networking opportunities.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Button render={<Link href="/login" />} variant="ghost" size="sm">
            Sign in
          </Button>
          <Button render={<Link href="/signup" />} size="sm">
            Sign up
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
        <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl leading-tight">
          Your Graduate Career Starts Here
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          {PLATFORM_NAME} helps grad students build professional portfolios,
          connect with recruiters, and collaborate with peers — all in one
          platform.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/signup" />} size="lg" className="min-h-[44px]">
            Sign Up as Student
          </Button>
          <Button
            render={<Link href="/signup/recruiter" />}
            variant="outline"
            size="lg"
            className="min-h-[44px]"
          >
            Sign Up as Recruiter
          </Button>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="section-container py-16 sm:py-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl">
            Everything you need to stand out
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tools designed for graduate students navigating their careers.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="mt-3 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="flex flex-col items-center px-4 py-16 text-center sm:py-24">
        <h2 className="text-3xl sm:text-4xl">Ready to get started?</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          Join {PLATFORM_NAME} today and take the next step in your career.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/signup" />} size="lg" className="min-h-[44px]">
            Create your portfolio
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
