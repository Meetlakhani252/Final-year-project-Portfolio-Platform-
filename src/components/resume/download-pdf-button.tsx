"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/lib/pdf";

export function DownloadPDFButton({
  data,
  variant = "default",
}: {
  data: ResumeData;
  variant?: "default" | "outline";
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data.personal.full_name || "resume").replace(/\s+/g, "_")}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — browser will show no download
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} onClick={handleDownload} disabled={loading}>
      <Download className="size-4" />
      {loading ? "Generating…" : "Download PDF"}
    </Button>
  );
}
