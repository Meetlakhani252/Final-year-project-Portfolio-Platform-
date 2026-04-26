"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Briefcase, Mail, ArrowLeft } from "lucide-react";
import {
  signIn,
  signInWithGithub,
  requestEmailOtp,
  verifyEmailOtp,
} from "@/actions/auth";
import { signInSchema, type SignInInput } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLATFORM_NAME } from "@/lib/constants";

type LoginMode = "student" | "recruiter";
type OtpStep = "idle" | "email" | "code";

const MODE_CONFIG = {
  student: {
    title: "Student Sign In",
    description: "Sign in to your student account",
    signupLabel: "Don't have an account?",
    signupLinkLabel: "Sign up",
    signupHref: "/signup",
  },
  recruiter: {
    title: "Recruiter Sign In",
    description: "Sign in to your recruiter account",
    signupLabel: "No recruiter account?",
    signupLinkLabel: "Register here",
    signupHref: "/signup/recruiter",
  },
};

export function LoginForm() {
  const [mode, setMode] = useState<LoginMode>("student");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  // OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const config = MODE_CONFIG[mode];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  function resetOtp() {
    setOtpStep("idle");
    setOtpEmail("");
    setOtpCode("");
    setOtpError(null);
  }

  function switchMode(newMode: LoginMode) {
    setMode(newMode);
    setError(null);
    resetOtp();
  }

  function onSubmit(data: SignInInput) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(data);
      if (result?.error) setError(result.error);
    });
  }

  function handleGithubSignIn() {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGithub();
      if (result?.error) setError(result.error);
    });
  }

  function handleSendOtp() {
    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setOtpError("Please enter a valid email address");
      return;
    }
    setOtpError(null);
    startTransition(async () => {
      const result = await requestEmailOtp(otpEmail);
      if (result?.error) {
        setOtpError(result.error);
        return;
      }
      setOtpStep("code");
    });
  }

  function handleVerifyOtp() {
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError(null);
    startTransition(async () => {
      const result = await verifyEmailOtp(otpEmail, otpCode.trim());
      if (result?.error) setOtpError(result.error);
    });
  }

  function handleResendOtp() {
    setOtpCode("");
    setOtpError(null);
    startTransition(async () => {
      const result = await requestEmailOtp(otpEmail);
      if (result?.error) setOtpError(result.error);
    });
  }

  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">{PLATFORM_NAME}</CardTitle>

        {/* Student / Recruiter toggle */}
        <div className="mt-4 flex rounded-lg border bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => switchMode("student")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
              mode === "student"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GraduationCap className="size-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => switchMode("recruiter")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
              mode === "recruiter"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="size-4" />
            Recruiter
          </button>
        </div>

        <CardDescription className="mt-2">{config.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {(error || callbackError) && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error || "Authentication failed. Please try again."}
          </div>
        )}

        {/* Email + password form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Username</Label>
            <Input
              id="identifier"
              placeholder="you@example.com or john123"
              autoComplete="off"
              {...register("identifier")}
              aria-invalid={!!errors.identifier}
            />
            {errors.identifier && (
              <p className="text-xs text-destructive">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="off"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : config.title}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth + OTP */}
        <div className="space-y-2">
          {/* GitHub — students only */}
          {mode === "student" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGithubSignIn}
              disabled={isPending}
            >
              <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
          )}

          {/* Email OTP — step: idle */}
          {otpStep === "idle" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOtpStep("email")}
              disabled={isPending}
            >
              <Mail className="mr-2 size-4" />
              Sign in with email code
            </Button>
          )}

          {/* Email OTP — step: email input */}
          {otpStep === "email" && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetOtp}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <p className="text-sm font-medium">Email verification</p>
              </div>
              <p className="text-xs text-muted-foreground">
                We'll send a 6-digit code to your inbox.
              </p>
              {otpError && (
                <p className="text-xs text-destructive">{otpError}</p>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  autoComplete="off"
                  autoFocus
                />
                <Button
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={isPending}
                >
                  {isPending ? "Sending..." : "Send code"}
                </Button>
              </div>
            </div>
          )}

          {/* Email OTP — step: code input */}
          {otpStep === "code" && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setOtpStep("email"); setOtpCode(""); setOtpError(null); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <p className="text-sm font-medium">Check your inbox</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Code sent to <span className="font-medium text-foreground">{otpEmail}</span>.
                Enter it below — it expires in 1 hour.
              </p>
              {otpError && (
                <p className="text-xs text-destructive">{otpError}</p>
              )}
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  autoFocus
                  className="text-center tracking-widest text-lg font-mono"
                />
                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={isPending}
                >
                  {isPending ? "Verifying..." : "Verify code"}
                </Button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isPending}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Didn't receive it? Resend code
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
        <span>{config.signupLabel}</span>
        <Link href={config.signupHref} className="text-primary hover:underline">
          {config.signupLinkLabel}
        </Link>
      </CardFooter>
    </Card>
  );
}
