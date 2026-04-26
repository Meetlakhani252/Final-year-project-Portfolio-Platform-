import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  discoverStudents,
  getBookmarkedStudentIds,
  type DiscoverFilters,
} from "@/actions/recruiter";
import { PAGE_SIZE_DISCOVER as DISCOVER_PAGE_SIZE } from "@/lib/constants";
import { DiscoverFilter } from "@/components/recruiter/discover-filter";
import { StudentCard } from "@/components/recruiter/student-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Discover Students — Profolio" };

function buildPageUrl(
  params: Record<string, string | string[] | undefined>,
  page: number
): string {
  const p = new URLSearchParams();
  const skills = params.skill
    ? Array.isArray(params.skill)
      ? params.skill
      : [params.skill]
    : [];
  skills.forEach((s) => p.append("skill", s));
  if (params.year && typeof params.year === "string") p.set("year", params.year);
  if (params.university && typeof params.university === "string")
    p.set("university", params.university);
  if (params.min_gpa && typeof params.min_gpa === "string")
    p.set("min_gpa", params.min_gpa);
  if (params.available_for && typeof params.available_for === "string")
    p.set("available_for", params.available_for);
  if (page > 0) p.set("page", String(page));
  return `?${p.toString()}`;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const skills = params.skill
    ? Array.isArray(params.skill)
      ? params.skill
      : [params.skill]
    : [];
  const graduation_year =
    typeof params.year === "string" && params.year
      ? parseInt(params.year, 10)
      : undefined;
  const university =
    typeof params.university === "string" ? params.university : undefined;
  const min_gpa =
    typeof params.min_gpa === "string" ? parseFloat(params.min_gpa) : undefined;
  const available_for =
    typeof params.available_for === "string" ? params.available_for : undefined;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) : 0;

  const hasFilters = Boolean(
    skills.length > 0 ||
      graduation_year !== undefined ||
      university ||
      min_gpa !== undefined ||
      available_for
  );

  const filters: DiscoverFilters = {
    skills,
    graduation_year,
    university,
    min_gpa,
    available_for,
    page,
  };

  const [{ students, total }, bookmarkedIds] = await Promise.all([
    discoverStudents(filters),
    getBookmarkedStudentIds(),
  ]);

  const bookmarkedSet = new Set(bookmarkedIds);
  const totalPages = Math.ceil(total / DISCOVER_PAGE_SIZE);
  const prevUrl = page > 0 ? buildPageUrl(params, page - 1) : null;
  const nextUrl = page < totalPages - 1 ? buildPageUrl(params, page + 1) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="glass-card p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110">
          <Search className="size-24 text-primary" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Search className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
              <span className="text-primary">Scanner:</span> Discover Talent
            </h1>
            <p className="mt-1 text-muted-foreground font-sans font-normal">
              Find graduate students matching your hiring criteria using advanced search protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Filter panel — client component needs Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <DiscoverFilter />
      </Suspense>

      {/* Results */}
      {!hasFilters ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-24 text-center">
          <Search className="size-10 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">
            Use filters to discover students
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Filter by skills, graduation year, university, GPA, or availability
            to see matching candidates.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-24 text-center">
          <Search className="size-10 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No students found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters to broaden the search.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} student{total !== 1 ? "s" : ""} found
              {totalPages > 1 && (
                <span>
                  {" "}
                  — page {page + 1} of {totalPages}
                </span>
              )}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isBookmarked={bookmarkedSet.has(student.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                render={prevUrl ? <Link href={prevUrl} /> : undefined}
                variant="outline"
                size="sm"
                disabled={!prevUrl}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                render={nextUrl ? <Link href={nextUrl} /> : undefined}
                variant="outline"
                size="sm"
                disabled={!nextUrl}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
