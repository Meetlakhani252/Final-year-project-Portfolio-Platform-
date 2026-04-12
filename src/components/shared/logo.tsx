import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { PLATFORM_NAME } from "@/lib/constants";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <GraduationCap className="size-7 text-primary" />
      <span className="heading-serif text-lg">{PLATFORM_NAME}</span>
    </Link>
  );
}
