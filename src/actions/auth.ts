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

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
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

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
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

  return { error: "Failed to initiate Google sign in" };
}
