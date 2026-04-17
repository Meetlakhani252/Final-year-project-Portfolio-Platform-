export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClassicPDFTemplate } from "@/components/resume/classic-pdf-template";
import { ModernPDFTemplate } from "@/components/resume/modern-pdf-template";
import type { ResumeData } from "@/lib/pdf";

export async function POST(request: Request) {
  let data: ResumeData;
  try {
    data = (await request.json()) as ResumeData;
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const element =
    data.template === "modern" ? (
      <ModernPDFTemplate data={data} />
    ) : (
      <ClassicPDFTemplate data={data} />
    );

  const buffer = await renderToBuffer(element);
  const uint8 = new Uint8Array(buffer);

  const filename = `${(data.personal.full_name || "resume").replace(/\s+/g, "_")}_resume.pdf`;

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
