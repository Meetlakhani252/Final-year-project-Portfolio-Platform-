"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  aboutSchema,
  avatarFileSchema,
  projectSchema,
  projectScreenshotFileSchema,
  skillSchema,
  certificationSchema,
  educationSchema,
  blogPostSchema,
  socialLinksSchema,
  MAX_SCREENSHOTS_PER_PROJECT,
  type AboutInput,
  type ProjectInput,
  type CertificationInput,
  type EducationInput,
  type BlogPostInput,
  type SocialLinksInput,
} from "@/validations/portfolio";
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import { createPortfolioSnapshot } from "@/lib/snapshots";

const PROJECT_IMAGES_BUCKET = "project-images";

async function getUsernameForRevalidate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();
  return data?.username ?? null;
}

function revalidatePortfolio(username: string | null) {
  revalidatePath("/portfolio/edit");
  if (username) revalidatePath(`/u/${username}`);
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function updateProfile(
  input: AboutInput
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      bio: data.bio || null,
      university: data.university || null,
      program: data.program || null,
      graduation_year: data.graduation_year ?? null,
      gpa: data.gpa ?? null,
      gpa_public: data.gpa_public ?? false,
    })
    .eq("id", user.id)
    .select("username")
    .single();

  if (error) {
    return { ok: false, error: "Failed to update profile. Please try again." };
  }

  revalidatePath("/portfolio/edit");
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }

  return { ok: true };
}

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided" };
  }

  const parsed = avatarFileSchema.safeParse(file);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return { ok: false, error: "Failed to upload avatar. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Cache-bust so the new image shows immediately
  const url = `${publicUrl}?v=${Date.now()}`;

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id)
    .select("username")
    .single();

  if (updateError) {
    return { ok: false, error: "Failed to save avatar URL." };
  }

  await supabase.auth.updateUser({ data: { avatar_url: url } });

  revalidatePath("/portfolio/edit");
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }

  return { ok: true, data: { url } };
}

// ---------- Projects ----------

function parseProjectFormData(formData: FormData): {
  input: ProjectInput;
  newFiles: File[];
  keepIds: string[];
} {
  const tech_stack = formData
    .getAll("tech_stack")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const input: ProjectInput = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    tech_stack,
    github_url: String(formData.get("github_url") ?? "").trim(),
    live_url: String(formData.get("live_url") ?? "").trim(),
  };

  const newFiles = formData
    .getAll("screenshots")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const keepIds = formData.getAll("keep_screenshot_ids").map((v) => String(v));

  return { input, newFiles, keepIds };
}

async function uploadScreenshots(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  projectId: string,
  files: File[],
  startOrder: number
): Promise<ActionResult<{ image_url: string; display_order: number }[]>> {
  const uploaded: { image_url: string; display_order: number }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const parsed = projectScreenshotFileSchema.safeParse(file);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${projectId}/${Date.now()}-${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PROJECT_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
  console.error('Upload error details:', uploadError)
  return { ok: false, error: `Failed to upload screenshot: ${uploadError.message}` }
}

    const {
      data: { publicUrl },
    } = supabase.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(path);

    uploaded.push({
      image_url: publicUrl,
      display_order: startOrder + i,
    });
  }

  return { ok: true, data: uploaded };
}

async function removeScreenshotStorageObjects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  urls: string[]
) {
  const prefix = `/storage/v1/object/public/${PROJECT_IMAGES_BUCKET}/`;
  const paths = urls
    .map((u) => {
      const idx = u.indexOf(prefix);
      return idx >= 0 ? u.slice(idx + prefix.length).split("?")[0] : null;
    })
    .filter((p): p is string => !!p);
  if (paths.length > 0) {
    await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove(paths);
  }
}

export async function addProject(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { input, newFiles } = parseProjectFormData(formData);

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  if (newFiles.length > MAX_SCREENSHOTS_PER_PROJECT) {
    return {
      ok: false,
      error: `At most ${MAX_SCREENSHOTS_PER_PROJECT} screenshots per project`,
    };
  }

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      profile_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      tech_stack: parsed.data.tech_stack,
      github_url: parsed.data.github_url || null,
      live_url: parsed.data.live_url || null,
      display_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !project) {
    return { ok: false, error: "Failed to create project." };
  }

  if (newFiles.length > 0) {
    const up = await uploadScreenshots(
      supabase,
      user.id,
      project.id,
      newFiles,
      0
    );
    if (!up.ok) {
      await supabase.from("projects").delete().eq("id", project.id);
      return up;
    }
    const rows = up.data!.map((s) => ({
      project_id: project.id,
      image_url: s.image_url,
      display_order: s.display_order,
    }));
    const { error: ssError } = await supabase
      .from("project_screenshots")
      .insert(rows);
    if (ssError) {
      return { ok: false, error: "Failed to save screenshots." };
    }
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);

  // Fire-and-forget snapshot — don't block the response
  createPortfolioSnapshot(
    supabase,
    user.id,
    "project_added",
    `Added project: ${parsed.data.title}`
  ).catch(() => {});

  return { ok: true, data: { id: project.id } };
}

export async function updateProject(
  projectId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { input, newFiles, keepIds } = parseProjectFormData(formData);

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("projects")
    .select("id, profile_id")
    .eq("id", projectId)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Project not found." };
  }

  // Fetch current screenshots
  const { data: currentScreenshots } = await supabase
    .from("project_screenshots")
    .select("id, image_url, display_order")
    .eq("project_id", projectId)
    .order("display_order");

  const current = currentScreenshots ?? [];
  const keepSet = new Set(keepIds);
  const toRemove = current.filter((s) => !keepSet.has(s.id));
  const toKeep = current.filter((s) => keepSet.has(s.id));

  if (toKeep.length + newFiles.length > MAX_SCREENSHOTS_PER_PROJECT) {
    return {
      ok: false,
      error: `At most ${MAX_SCREENSHOTS_PER_PROJECT} screenshots per project`,
    };
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      tech_stack: parsed.data.tech_stack,
      github_url: parsed.data.github_url || null,
      live_url: parsed.data.live_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (updateError) {
    return { ok: false, error: "Failed to update project." };
  }

  if (toRemove.length > 0) {
    await supabase
      .from("project_screenshots")
      .delete()
      .in(
        "id",
        toRemove.map((s) => s.id)
      );
    await removeScreenshotStorageObjects(
      supabase,
      toRemove.map((s) => s.image_url)
    );
  }

  if (newFiles.length > 0) {
    const up = await uploadScreenshots(
      supabase,
      user.id,
      projectId,
      newFiles,
      toKeep.length
    );
    if (!up.ok) return up;
    const rows = up.data!.map((s) => ({
      project_id: projectId,
      image_url: s.image_url,
      display_order: s.display_order,
    }));
    const { error: ssError } = await supabase
      .from("project_screenshots")
      .insert(rows);
    if (ssError) {
      return { ok: false, error: "Failed to save screenshots." };
    }
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

// ---------- Skills ----------

export async function addSkill(
  name: string
): Promise<ActionResult<{ id: string; name: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = skillSchema.safeParse({ name });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const cleanName = parsed.data.name;

  const { data: existing } = await supabase
    .from("skills")
    .select("id")
    .eq("profile_id", user.id)
    .ilike("name", cleanName)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "Skill already added" };
  }

  const { data: skill, error } = await supabase
    .from("skills")
    .insert({
      profile_id: user.id,
      name: cleanName,
      source: "manual",
    })
    .select("id, name")
    .single();

  if (error || !skill) {
    return { ok: false, error: "Failed to add skill." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true, data: { id: skill.id, name: skill.name } };
}

export async function removeSkill(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("skills")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Skill not found." };
  }

  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) {
    return { ok: false, error: "Failed to remove skill." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

// ---------- Certifications ----------

export async function addCertification(
  input: CertificationInput
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { count } = await supabase
    .from("certifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const { data: cert, error } = await supabase
    .from("certifications")
    .insert({
      profile_id: user.id,
      name: parsed.data.name,
      issuer: parsed.data.issuer,
      issue_date: parsed.data.issue_date || null,
      credential_url: parsed.data.credential_url || null,
      display_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !cert) {
    return { ok: false, error: "Failed to add certification." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);

  // Fire-and-forget snapshot — don't block the response
  createPortfolioSnapshot(
    supabase,
    user.id,
    "certification_added",
    `Added certification: ${parsed.data.name}`
  ).catch(() => {});

  return { ok: true, data: { id: cert.id } };
}

export async function updateCertification(
  id: string,
  input: CertificationInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { data: existing } = await supabase
    .from("certifications")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Certification not found." };
  }

  const { error } = await supabase
    .from("certifications")
    .update({
      name: parsed.data.name,
      issuer: parsed.data.issuer,
      issue_date: parsed.data.issue_date || null,
      credential_url: parsed.data.credential_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to update certification." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("certifications")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Certification not found." };
  }

  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to delete certification." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

// ---------- Education ----------

export async function addEducation(
  input: EducationInput
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { count } = await supabase
    .from("education")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const { data: edu, error } = await supabase
    .from("education")
    .insert({
      profile_id: user.id,
      institution: parsed.data.institution,
      degree: parsed.data.degree,
      field_of_study: parsed.data.field_of_study || null,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      gpa: parsed.data.gpa ?? null,
      courses: parsed.data.courses ?? [],
      display_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !edu) {
    return { ok: false, error: "Failed to add education." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true, data: { id: edu.id } };
}

export async function updateEducation(
  id: string,
  input: EducationInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { data: existing } = await supabase
    .from("education")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Education not found." };
  }

  const { error } = await supabase
    .from("education")
    .update({
      institution: parsed.data.institution,
      degree: parsed.data.degree,
      field_of_study: parsed.data.field_of_study || null,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      gpa: parsed.data.gpa ?? null,
      courses: parsed.data.courses ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to update education." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("education")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Education not found." };
  }

  const { error } = await supabase
    .from("education")
    .delete()
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to delete education." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

export async function deleteProject(
  projectId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("projects")
    .select("id, profile_id")
    .eq("id", projectId)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Project not found." };
  }

  const { data: screenshots } = await supabase
    .from("project_screenshots")
    .select("image_url")
    .eq("project_id", projectId);

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return { ok: false, error: "Failed to delete project." };
  }

  if (screenshots && screenshots.length > 0) {
    await removeScreenshotStorageObjects(
      supabase,
      screenshots.map((s) => s.image_url)
    );
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

// ---------- Blog Posts ----------

const PORTFOLIO_PHOTOS_BUCKET = "portfolio-photos";

export async function saveBlogPost(
  input: BlogPostInput,
  postId?: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { title, slug, content, content_plain } = parsed.data;

  if (postId) {
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id, profile_id")
      .eq("id", postId)
      .single();

    if (!existing || existing.profile_id !== user.id) {
      return { ok: false, error: "Post not found." };
    }

    const { error } = await supabase
      .from("blog_posts")
      .update({
        title,
        slug,
        content,
        content_plain: content_plain || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "A post with this slug already exists." };
      }
      return { ok: false, error: "Failed to update post." };
    }

    const username = await getUsernameForRevalidate(supabase, user.id);
    revalidatePortfolio(username);
    return { ok: true, data: { id: postId } };
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({
      profile_id: user.id,
      title,
      slug,
      content,
      content_plain: content_plain || null,
    })
    .select("id")
    .single();

  if (error || !post) {
    if (error?.code === "23505") {
      return { ok: false, error: "A post with this slug already exists." };
    }
    return { ok: false, error: "Failed to create post." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true, data: { id: post.id } };
}

export async function publishBlogPost(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Post not found." };
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to publish post." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

export async function unpublishBlogPost(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Post not found." };
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to unpublish post." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Post not found." };
  }

  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to delete post." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

// ---------- Portfolio Photos ----------

export async function uploadPortfolioPhoto(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided" };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "Image must be less than 5MB" };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP, and GIF images are accepted",
    };
  }

  const caption = String(formData.get("caption") ?? "").trim() || null;
  const altText = String(formData.get("alt_text") ?? "").trim() || null;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PORTFOLIO_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("Portfolio photo upload error:", uploadError);
    return { ok: false, error: `Failed to upload photo: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PORTFOLIO_PHOTOS_BUCKET).getPublicUrl(path);

  const { count } = await supabase
    .from("portfolio_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const { data: photo, error } = await supabase
    .from("portfolio_photos")
    .insert({
      profile_id: user.id,
      image_url: publicUrl,
      caption,
      alt_text: altText,
      display_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !photo) {
    return { ok: false, error: "Failed to save photo." };
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true, data: { id: photo.id } };
}

export async function deletePortfolioPhoto(
  id: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("portfolio_photos")
    .select("id, profile_id, image_url")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return { ok: false, error: "Photo not found." };
  }

  const { error } = await supabase
    .from("portfolio_photos")
    .delete()
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to delete photo." };
  }

  const prefix = `/storage/v1/object/public/${PORTFOLIO_PHOTOS_BUCKET}/`;
  const idx = existing.image_url.indexOf(prefix);
  if (idx >= 0) {
    const storagePath = existing.image_url
      .slice(idx + prefix.length)
      .split("?")[0];
    await supabase.storage.from(PORTFOLIO_PHOTOS_BUCKET).remove([storagePath]);
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

// ---------- Section Reorder ----------

const DEFAULT_SECTION_ORDER = [
  "about",
  "skills",
  "projects",
  "certifications",
  "education",
  "blog",
  "photos",
  "social",
];

export async function reorderSections(
  order: string[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const valid = new Set(DEFAULT_SECTION_ORDER);
  const filtered = order.filter((s) => valid.has(s));
  if (filtered.length !== DEFAULT_SECTION_ORDER.length) {
    return { ok: false, error: "Invalid section list." };
  }

  const { data: existing } = await supabase
    .from("portfolio_section_order")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("portfolio_section_order")
      .update({
        section_order: filtered,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", user.id);

    if (error) {
      return { ok: false, error: "Failed to save section order." };
    }
  } else {
    const { error } = await supabase
      .from("portfolio_section_order")
      .insert({
        profile_id: user.id,
        section_order: filtered,
      });

    if (error) {
      return { ok: false, error: "Failed to save section order." };
    }
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}

// ---------- Social Links ----------

export async function updateSocialLinks(
  input: SocialLinksInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = socialLinksSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { error: deleteError } = await supabase
    .from("social_links")
    .delete()
    .eq("profile_id", user.id);

  if (deleteError) {
    return { ok: false, error: "Failed to update social links." };
  }

  const linksToInsert = parsed.data.links.filter((l) => l.url.trim());

  if (linksToInsert.length > 0) {
    const { error: insertError } = await supabase.from("social_links").insert(
      linksToInsert.map((l) => ({
        profile_id: user.id,
        platform: l.platform,
        url: l.url.trim(),
      }))
    );

    if (insertError) {
      return { ok: false, error: "Failed to save social links." };
    }
  }

  const username = await getUsernameForRevalidate(supabase, user.id);
  revalidatePortfolio(username);
  return { ok: true };
}
