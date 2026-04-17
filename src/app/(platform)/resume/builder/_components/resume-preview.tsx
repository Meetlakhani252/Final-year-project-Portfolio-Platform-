"use client";

import type { ResumeData } from "@/lib/pdf";
import { ClassicHTMLTemplate } from "@/components/resume/classic-html-template";
import { ModernHTMLTemplate } from "@/components/resume/modern-html-template";

const PAPER_WIDTH = 794;
const SCALE = 0.52;

export function ResumePreview({ data }: { data: ResumeData }) {
  const Template =
    data.template === "modern" ? ModernHTMLTemplate : ClassicHTMLTemplate;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
      <div
        className="overflow-hidden rounded-md border shadow-sm"
        style={{ width: PAPER_WIDTH * SCALE, height: 1123 * SCALE }}
      >
        <div
          style={{
            width: PAPER_WIDTH,
            transformOrigin: "top left",
            transform: `scale(${SCALE})`,
          }}
        >
          <Template data={data} />
        </div>
      </div>
    </div>
  );
}
