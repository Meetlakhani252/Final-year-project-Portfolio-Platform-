"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  recruiterSignUpSchema,
  type SignInInput,
  type SignUpInput,
  type RecruiterSignUpInput,
} from "@/validations/auth";
import { APP_URL } from "@/lib/constants";
import { sendWelcomeEmail } from "@/lib/resend";

export type AuthResult = {
  error?: string;
};

export async function signUp(data: SignUpInput): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Clear any existing session so the old user's cookies don't persist
  await supabase.auth.signOut();

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
        full_name: parsed.data.full_name,
        role: "student",
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists" };
    }
    return { error: error.message };
  }

  // Send welcome email (fire and forget — don't block redirect on email failure)
  sendWelcomeEmail(parsed.data.email, {
    fullName: parsed.data.full_name,
    role: "student",
    dashboardUrl: `${APP_URL}/dashboard`,
  }).catch(() => {});

  // If email confirmation is required, session is null — tell the user to check email
  if (!signUpData.session) {
    return { error: "CHECK_EMAIL" };
  }

  redirect("/onboarding");
}

export async function recruiterSignUp(
  data: RecruiterSignUpInput
): Promise<AuthResult> {
  const parsed = recruiterSignUpSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  await supabase.auth.signOut();

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
        full_name: parsed.data.full_name,
        role: parsed.data.role,
        company: parsed.data.company,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists" };
    }
    return { error: error.message };
  }

  // Send welcome email (fire and forget)
  sendWelcomeEmail(parsed.data.email, {
    fullName: parsed.data.full_name,
    role: parsed.data.role as "recruiter" | "organizer",
    dashboardUrl: `${APP_URL}/dashboard`,
  }).catch(() => {});

  if (!signUpData.session) {
    return { error: "CHECK_EMAIL" };
  }

  // Recruiters and organizers skip the student onboarding wizard
  if (signUpData.user) {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", signUpData.user.id);
  }

  redirect("/dashboard");
}

export async function signIn(data: SignInInput): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  let email = parsed.data.identifier;

  // If identifier doesn't look like an email, assume it's a username
  if (!email.includes("@")) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", email)
      .single();

    if (profileError || !profile) {
      return { error: "Invalid username or password" };
    }
    email = profile.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Invalid email or password" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const userRole = (user.user_metadata?.role as string) ?? "student";

    // Only students go through onboarding; recruiters/organizers go straight to dashboard
    if (userRole === "student") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        redirect("/onboarding");
      }
    }
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGithub(): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Failed to initiate GitHub sign in" };
}

export async function requestEmailOtp(email: string): Promise<AuthResult> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: "Invalid or expired code. Please try again." };
  }

  const user = data.user;
  if (user) {
    const userRole = (user.user_metadata?.role as string) ?? "student";
    if (userRole === "student") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        redirect("/onboarding");
      }
    }
  }

  redirect("/dashboard");
}
