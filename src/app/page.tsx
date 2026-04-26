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
        <h1 className="max-w-3xl font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
          <span className="text-primary drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Your Graduate Career</span> Starts Here
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
          <h2 className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to <span className="text-primary">stand out</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tools designed for graduate students navigating their careers.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-6">
          {/* Main Feature - Bento Style */}
          <Card key={FEATURES[0].title} className="glass-card md:col-span-2 md:row-span-2 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col justify-center">
            <CardHeader>
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4">
                <Briefcase className="size-8 text-primary" />
              </div>
              <CardTitle className="font-mono text-3xl">{FEATURES[0].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg leading-relaxed">
                {FEATURES[0].description}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Small Features */}
          {FEATURES.slice(1, 4).map((feature) => (
            <Card key={feature.title} className="glass-card transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="mt-3 font-mono text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}

          {/* Wide Feature */}
          <Card key={FEATURES[4].title} className="glass-card md:col-span-2 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] flex flex-row items-center">
             <CardHeader className="flex-1">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Search className="size-5 text-primary" />
                </div>
                <CardTitle className="mt-3 font-mono text-lg">{FEATURES[4].title}</CardTitle>
                <CardDescription className="text-sm">
                  {FEATURES[4].description}
                </CardDescription>
             </CardHeader>
          </Card>

          <Card key={FEATURES[5].title} className="glass-card transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
             <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Calendar className="size-5 text-primary" />
                </div>
                <CardTitle className="mt-3 font-mono text-lg">{FEATURES[5].title}</CardTitle>
                <CardDescription className="text-sm">
                  {FEATURES[5].description}
                </CardDescription>
             </CardHeader>
          </Card>
        </div>
      </section>

      <Separator className="bg-primary/10" />

      {/* CTA */}
      <section className="flex flex-col items-center px-4 py-16 text-center sm:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="glass-card p-12 rounded-3xl max-w-4xl relative z-10 border-primary/20">
          <h2 className="font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl">Ready to get started?</h2>
          <p className="mt-4 max-w-md mx-auto text-muted-foreground text-lg">
            Join {PLATFORM_NAME} today and initialize your professional career sequence.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button render={<Link href="/signup" />} size="lg" className="min-h-[50px] px-10 shadow-[0_0_20px_rgba(34,211,238,0.4)] text-lg">
              Create your portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
