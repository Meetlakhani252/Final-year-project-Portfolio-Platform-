"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signUp, signInWithGithub, verifySignupOtp } from "@/actions/auth";
import { signUpSchema, type SignUpInput } from "@/validations/auth";
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
import { PLATFORM_NAME } from "@/lib/constants";

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const {
    formState: { errors },
    setValue,
    watch,
    register,
    handleSubmit,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const fullName = watch("full_name");
  const [hasManuallyEditedUsername, setHasManuallyEditedUsername] = useState(false);

  // Effect to update username when fullName changes, if not manually edited
  useEffect(() => {
    if (fullName && !hasManuallyEditedUsername) {
      const firstName = fullName.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (firstName) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        setValue("username", `${firstName}${randomNum}`, { shouldValidate: true });
      }
    }
  }, [fullName, hasManuallyEditedUsername, setValue]);

  function onSubmit(data: SignUpInput) {
    setError(null);
    startTransition(async () => {
      const result = await signUp(data);
      if (result?.error === "CHECK_EMAIL") {
        setPendingEmail(data.email);
        setCheckEmail(true);
      } else if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleVerifyOtp() {
    if (!otpCode || otpCode.trim().length < 8) {
      setOtpError("Please enter the full 8-digit code");
      return;
    }
    setOtpError(null);
    startTransition(async () => {
      const result = await verifySignupOtp(pendingEmail, otpCode.trim());
      if (result?.error) setOtpError(result.error);
    });
  }

  function handleGithubSignIn() {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGithub();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (checkEmail) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent an 8-digit code to{" "}
            <span className="font-medium text-foreground">{pendingEmail}</span>.
            Enter it below to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {otpError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {otpError}
            </div>
          )}
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="12345678"
              maxLength={8}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              autoFocus
              className="text-center tracking-widest text-lg font-mono"
            />
            <Button className="w-full" onClick={handleVerifyOtp} disabled={isPending}>
              {isPending ? "Verifying..." : "Verify & Continue"}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t receive a code?{" "}
            <button
              type="button"
              onClick={() => { setCheckEmail(false); setOtpCode(""); setOtpError(null); }}
              className="text-primary hover:underline"
            >
              Go back
            </button>{" "}
            or check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="size-3" />
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{PLATFORM_NAME}</CardTitle>
        <CardDescription>Create your student account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              autoComplete="off"
              {...register("full_name")}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="johndoe123"
              autoComplete="off"
              {...register("username", {
                onChange: () => setHasManuallyEditedUsername(true)
              })}
              aria-invalid={!!errors.username}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Suggested: First name + 3 numbers (e.g. {fullName?.split(" ")[0] || "John"}123)
            </p>
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="off"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
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
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

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
      </CardContent>
      <CardFooter className="flex-col gap-2 text-center text-sm text-muted-foreground">
        <div className="flex gap-1">
          <span>Already have an account?</span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
        <div className="flex gap-1">
          <span>Are you a recruiter or organizer?</span>
          <Link
            href="/signup/recruiter"
            className="text-primary hover:underline"
          >
            Sign up here
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
