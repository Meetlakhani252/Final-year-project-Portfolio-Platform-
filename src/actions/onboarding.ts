"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  completeOnboardingSchema,
  type CompleteOnboardingInput,
} from "@/validations/onboarding";
import {
  DEFAULT_SECTION_ORDER,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";

export type OnboardingResult = {
  error?: string;
};

export async function completeOnboarding(
  formData: FormData
): Promise<OnboardingResult> {
  const supabase = await createClient();

  // Validate auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parse form fields
  const rawData: CompleteOnboardingInput = {
    full_name: formData.get("full_name") as string,
    username: formData.get("username") as string,
    bio: (formData.get("bio") as string) || "",
    university: (formData.get("university") as string) || "",
    program: (formData.get("program") as string) || "",
    graduation_year: (formData.get("graduation_year") as string) || "",
    skills: JSON.parse((formData.get("skills") as string) || "[]"),
    github_url: (formData.get("github_url") as string) || "",
    linkedin_url: (formData.get("linkedin_url") as string) || "",
    website_url: (formData.get("website_url") as string) || "",
  };

  const parsed = completeOnboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Handle avatar upload
  let avatarUrl: string | null = null;
  const avatarFile = formData.get("avatar") as File | null;

  if (avatarFile && avatarFile.size > 0) {
    // Validate file
    if (avatarFile.size > MAX_IMAGE_SIZE) {
      return { error: "Image must be less than 5MB" };
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(avatarFile.type)) {
      return { error: "Only JPEG, PNG, WebP, and GIF images are accepted" };
    }

    const ext = avatarFile.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        upsert: true,
        contentType: avatarFile.type,
      });

    if (uploadError) {
      return { error: "Failed to upload avatar. Please try again." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    avatarUrl = publicUrl;
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      username: data.username,
      bio: data.bio || null,
      university: data.university || null,
      program: data.program || null,
      graduation_year: data.graduation_year
        ? Number(data.graduation_year)
        : null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Failed to save profile. Please try again." };
  }

  // Insert skills
  if (data.skills.length > 0) {
    const skillRows = data.skills.map((name) => ({
      profile_id: user.id,
      name,
      source: "manual" as const,
    }));

    const { error: skillsError } = await supabase
      .from("skills")
      .insert(skillRows);

    if (skillsError) {
      return { error: "Failed to save skills. Please try again." };
    }
  }

  // Insert social links
  const socialLinks: {
    profile_id: string;
    platform: "github" | "linkedin" | "website";
    url: string;
  }[] = [];

  if (data.github_url) {
    socialLinks.push({
      profile_id: user.id,
      platform: "github",
      url: data.github_url,
    });
  }
  if (data.linkedin_url) {
    socialLinks.push({
      profile_id: user.id,
      platform: "linkedin",
      url: data.linkedin_url,
    });
  }
  if (data.website_url) {
    socialLinks.push({
      profile_id: user.id,
      platform: "website",
      url: data.website_url,
    });
  }

  if (socialLinks.length > 0) {
    const { error: linksError } = await supabase
      .from("social_links")
      .insert(socialLinks);

    if (linksError) {
      return { error: "Failed to save social links. Please try again." };
    }
  }

  // Create default portfolio section order
  const { error: orderError } = await supabase
    .from("portfolio_section_order")
    .insert({
      profile_id: user.id,
      section_order: [...DEFAULT_SECTION_ORDER],
    });

  if (orderError) {
    // Non-critical — don't block onboarding
    console.error("Failed to create section order:", orderError);
  }

  // Update auth user metadata
  await supabase.auth.updateUser({
    data: { 
      full_name: data.full_name,
      username: data.username,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {})
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
