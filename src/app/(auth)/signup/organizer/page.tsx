"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { recruiterSignUp, verifyRecruiterSignupOtp } from "@/actions/auth";
import {
  recruiterSignUpSchema,
  type RecruiterSignUpInput,
} from "@/validations/auth";
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

export default function OrganizerSignUpPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterSignUpInput>({
    resolver: zodResolver(recruiterSignUpSchema),
    defaultValues: { role: "organizer" },
  });

  function onSubmit(data: RecruiterSignUpInput) {
    setError(null);
    startTransition(async () => {
      const result = await recruiterSignUp(data);
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
      const result = await verifyRecruiterSignupOtp(pendingEmail, otpCode.trim());
      if (result?.error) setOtpError(result.error);
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
        <CardDescription>Create your organizer account</CardDescription>
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
              placeholder="Jane Smith"
              autoComplete="name"
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
              placeholder="janesmith"
              autoComplete="username"
              {...register("username")}
              aria-invalid={!!errors.username}
            />
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
              placeholder="you@university.edu"
              autoComplete="email"
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

          <div className="space-y-2">
            <Label htmlFor="company">Organization / University</Label>
            <Input
              id="company"
              placeholder="MIT / HackMIT"
              {...register("company")}
              aria-invalid={!!errors.company}
            />
            {errors.company && (
              <p className="text-xs text-destructive">
                {errors.company.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-center text-sm text-muted-foreground">
        <div className="flex gap-1">
          <span>Already have an account?</span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
        <div className="flex gap-1">
          <span>Are you a student?</span>
          <Link href="/signup" className="text-primary hover:underline">
            Sign up here
          </Link>
        </div>
        <div className="flex gap-1">
          <span>Are you a recruiter?</span>
          <Link href="/signup/recruiter" className="text-primary hover:underline">
            Sign up here
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
