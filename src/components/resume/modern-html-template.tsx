import type { ResumeData } from "@/lib/pdf";

function ContactRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 4 }}>
      <p style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 1 }}>
        {label}
      </p>
      <p style={{ fontSize: 9, color: "#e2e8f0", wordBreak: "break-all" }}>{value}</p>
    </div>
  );
}

function RightSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 3 }}>
      <h2 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b" }}>
        {children}
      </h2>
    </div>
  );
}

export function ModernHTMLTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, education, skills, projects, certifications } = data;

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        display: "flex",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: 11,
        lineHeight: 1.5,
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 228,
          minHeight: "100%",
          backgroundColor: "#1e293b",
          padding: "44px 22px",
          flexShrink: 0,
        }}
      >
        {/* Name */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2, marginBottom: 4 }}>
            {personal.full_name || "Your Name"}
          </h1>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", marginBottom: 8, fontWeight: 700 }}>
            Contact
          </p>
          <ContactRow label="Email" value={personal.email} />
          <ContactRow label="Phone" value={personal.phone} />
          <ContactRow label="Location" value={personal.location} />
          <ContactRow label="LinkedIn" value={personal.linkedin} />
          <ContactRow label="GitHub" value={personal.github} />
          <ContactRow label="Website" value={personal.website} />
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <p style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", marginBottom: 8, fontWeight: 700 }}>
              Skills
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    backgroundColor: "#334155",
                    color: "#cbd5e1",
                    borderRadius: 3,
                    padding: "2px 6px",
                    fontSize: 9,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "44px 36px", backgroundColor: "#fff" }}>
        {/* Summary */}
        {summary && (
          <div style={{ marginBottom: 20 }}>
            <RightSectionHeading>Summary</RightSectionHeading>
            <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.65 }}>{summary}</p>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <RightSectionHeading>Education</RightSectionHeading>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 11, color: "#111" }}>{e.institution}</p>
                  <p style={{ fontSize: 10, color: "#6b7280" }}>
                    {[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {(e.start_date || e.end_date) && (
                  <p style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap", marginLeft: 12 }}>
                    {[e.start_date, e.end_date].filter(Boolean).join(" – ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <RightSectionHeading>Projects</RightSectionHeading>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontWeight: 600, fontSize: 11, color: "#111" }}>{p.title}</p>
                  {p.url && (
                    <p style={{ fontSize: 9, color: "#6b7280", marginLeft: 10 }}>{p.url}</p>
                  )}
                </div>
                {p.description && (
                  <p style={{ fontSize: 10, color: "#4b5563", marginTop: 2, lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                )}
                {p.tech_stack.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>
                    {p.tech_stack.map((t) => (
                      <span
                        key={t}
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          borderRadius: 3,
                          padding: "1px 5px",
                          fontSize: 9,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <RightSectionHeading>Certifications</RightSectionHeading>
            {certifications.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontSize: 11, color: "#111" }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: "#6b7280" }}>  ·  {c.issuer}</span>
                </p>
                {c.date && <p style={{ fontSize: 10, color: "#9ca3af" }}>{c.date}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
