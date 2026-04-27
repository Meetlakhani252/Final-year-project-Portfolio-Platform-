"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/get-user";
import { revalidatePath } from "next/cache";
import { createJobSchema, applyToJobSchema } from "@/validations/jobs";
import type { CreateJobInput } from "@/validations/jobs";
import { createNotification } from "@/actions/notifications";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobPosting = {
  id: string;
  recruiter_id: string;
  title: string;
  company: string;
  type: "job" | "internship";
  location: string | null;
  location_type: "onsite" | "remote" | "hybrid";
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  required_skills: string[];
  application_deadline: string | null;
  is_active: boolean;
  application_count: number;
  created_at: string;
  updated_at: string;
  recruiter?: {
    full_name: string;
    username: string;
  };
};

export type JobApplication = {
  id: string;
  job_id: string;
  student_id: string;
  cover_letter: string | null;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    university: string | null;
    program: string | null;
  };
  job?: Pick<JobPosting, "id" | "title" | "company" | "type" | "location" | "location_type">;
};

export type JobFilters = {
  type?: "job" | "internship";
  location_type?: "onsite" | "remote" | "hybrid";
  skill?: string;
};

// ─── Recruiter: Create job posting ───────────────────────────────────────────

export async function createJobPosting(
  input: CreateJobInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "recruiter")
    return { ok: false, error: "Only recruiters can post jobs." };

  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .insert({ recruiter_id: user.id, ...parsed.data })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "Failed to create job posting." };
  revalidatePath("/jobs");
  return { ok: true, id: data.id };
}

// ─── Recruiter: Update job posting ───────────────────────────────────────────

export async function updateJobPosting(
  jobId: string,
  input: CreateJobInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "recruiter") return { ok: false, error: "Unauthorized." };

  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_postings")
    .update(parsed.data)
    .eq("id", jobId)
    .eq("recruiter_id", user.id);

  if (error) return { ok: false, error: "Failed to update job posting." };
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

// ─── Recruiter: Toggle active/inactive ───────────────────────────────────────

export async function toggleJobActive(
  jobId: string
): Promise<{ ok: true; is_active: boolean } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "recruiter") return { ok: false, error: "Unauthorized." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("job_postings")
    .select("is_active")
    .eq("id", jobId)
    .eq("recruiter_id", user.id)
    .single();

  if (!existing) return { ok: false, error: "Job posting not found." };

  const { error } = await supabase
    .from("job_postings")
    .update({ is_active: !existing.is_active })
    .eq("id", jobId)
    .eq("recruiter_id", user.id);

  if (error) return { ok: false, error: "Failed to update status." };
  revalidatePath("/jobs");
  return { ok: true, is_active: !existing.is_active };
}

// ─── Recruiter: Delete job posting ───────────────────────────────────────────

export async function deleteJobPosting(
  jobId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "recruiter") return { ok: false, error: "Unauthorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_postings")
    .delete()
    .eq("id", jobId)
    .eq("recruiter_id", user.id);

  if (error) return { ok: false, error: "Failed to delete job posting." };
  revalidatePath("/jobs");
  return { ok: true };
}

// ─── Recruiter: Get my job postings ──────────────────────────────────────────

export async function getMyJobPostings(): Promise<JobPosting[]> {
  const user = await getUser();
  if (user.role !== "recruiter") return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("job_postings")
    .select("*")
    .eq("recruiter_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as JobPosting[];
}

// ─── Recruiter: Get single posting (for edit) ─────────────────────────────────

export async function getMyJobPosting(jobId: string): Promise<JobPosting | null> {
  const user = await getUser();
  if (user.role !== "recruiter") return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", jobId)
    .eq("recruiter_id", user.id)
    .single();

  return (data as JobPosting) ?? null;
}

// ─── Recruiter: Get applications for a job ───────────────────────────────────

export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  const user = await getUser();
  if (user.role !== "recruiter") return [];

  const supabase = await createClient();

  const { data: posting } = await supabase
    .from("job_postings")
    .select("id, title")
    .eq("id", jobId)
    .eq("recruiter_id", user.id)
    .single();

  if (!posting) return [];

  const { data: applications } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (!applications || applications.length === 0) return [];

  const studentIds = applications.map((a) => a.student_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, university, program")
    .in("id", studentIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return applications.map((a) => ({
    ...a,
    status: a.status as JobApplication["status"],
    student: profileMap.get(a.student_id) as JobApplication["student"],
  }));
}

// ─── Recruiter: Update application status ────────────────────────────────────

export async function updateApplicationStatus(
  applicationId: string,
  status: JobApplication["status"]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "recruiter") return { ok: false, error: "Unauthorized." };

  const supabase = await createClient();

  const { data: application } = await supabase
    .from("job_applications")
    .select("job_id")
    .eq("id", applicationId)
    .single();

  if (!application) return { ok: false, error: "Application not found." };

  const { data: posting } = await supabase
    .from("job_postings")
    .select("id")
    .eq("id", application.job_id)
    .eq("recruiter_id", user.id)
    .single();

  if (!posting) return { ok: false, error: "Unauthorized." };

  const { error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { ok: false, error: "Failed to update status." };

  // Create notification for the student
  if (status === "accepted" || status === "rejected") {
    const { data: appData } = await supabase
      .from("job_applications")
      .select("student_id, job:job_postings(title, company)")
      .eq("id", applicationId)
      .single();

    if (appData) {
      const jobInfo = appData.job as any;
      const title = status === "accepted" ? "Application Accepted! 🎉" : "Application Update";
      const body = status === "accepted" 
        ? `Congratulations! Your application for ${jobInfo.title} at ${jobInfo.company} has been accepted.`
        : `Your application for ${jobInfo.title} at ${jobInfo.company} was not selected at this time.`;

      await createNotification(appData.student_id, {
        type: "application",
        title,
        body,
        link: "/jobs/applications",
      });
    }
  }

  revalidatePath(`/jobs/${application.job_id}/applications`);
  revalidatePath("/jobs/applications");
  return { ok: true };
}

// ─── Student/Public: Get active job postings ─────────────────────────────────

export async function getActiveJobPostings(filters: JobFilters = {}): Promise<JobPosting[]> {
  const supabase = await createClient();

  let query = supabase
    .from("job_postings")
    .select("*, recruiter:profiles!recruiter_id(full_name, username)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.location_type) query = query.eq("location_type", filters.location_type);
  if (filters.skill) query = query.contains("required_skills", [filters.skill]);

  const { data } = await query;
  return (data ?? []) as unknown as JobPosting[];
}

// ─── Student/Public: Get single job posting detail ───────────────────────────

export async function getJobPostingDetail(jobId: string): Promise<JobPosting | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_postings")
    .select("*, recruiter:profiles!recruiter_id(full_name, username)")
    .eq("id", jobId)
    .single();

  return (data as unknown as JobPosting) ?? null;
}

// ─── Student: Apply to a job ──────────────────────────────────────────────────

export async function applyToJob(
  jobId: string,
  coverLetter: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  if (user.role !== "student")
    return { ok: false, error: "Only students can apply to jobs." };

  const parsed = applyToJobSchema.safeParse({ job_id: jobId, cover_letter: coverLetter });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("job_applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing) return { ok: false, error: "You have already applied to this position." };

  const { error } = await supabase.from("job_applications").insert({
    job_id: jobId,
    student_id: user.id,
    cover_letter: coverLetter?.trim() || null,
  });

  if (error) return { ok: false, error: "Failed to submit application." };
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs/applications");
  return { ok: true };
}

// ─── Student: Get my applications ────────────────────────────────────────────

export async function getMyApplications(): Promise<JobApplication[]> {
  const user = await getUser();
  if (user.role !== "student") return [];

  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("job_applications")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (!applications || applications.length === 0) return [];

  const jobIds = applications.map((a) => a.job_id);
  const { data: postings } = await supabase
    .from("job_postings")
    .select("id, title, company, type, location, location_type, recruiter_id")
    .in("id", jobIds);

  const postingMap = new Map((postings ?? []).map((p) => [p.id, p]));

  return applications.map((a) => ({
    ...a,
    status: a.status as JobApplication["status"],
    job: postingMap.get(a.job_id) as unknown as JobApplication["job"],
  }));
}

// ─── Student: Get IDs of jobs already applied to ─────────────────────────────

export async function getAppliedJobIds(): Promise<string[]> {
  const user = await getUser();
  if (user.role !== "student") return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("job_applications")
    .select("job_id")
    .eq("student_id", user.id);

  return (data ?? []).map((r) => r.job_id);
}
