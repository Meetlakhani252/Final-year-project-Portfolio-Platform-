import type { ResumeData } from "@/lib/pdf";

const contact = (items: string[]) =>
  items.filter(Boolean).join("  ·  ");

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 border-b border-gray-300 pb-0.5">
      <h2 className="text-[9px] font-bold uppercase tracking-[1.5px] text-gray-500">
        {children}
      </h2>
    </div>
  );
}

export function ClassicHTMLTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, education, skills, projects, certifications } =
    data;

  const contactLine = contact([
    personal.email,
    personal.phone,
    personal.location,
  ]);
  const linksLine = contact([
    personal.github,
    personal.linkedin,
    personal.website,
  ]);

  return (
    <div
      className="bg-white text-gray-900"
      style={{
        width: 794,
        minHeight: 1123,
        padding: "52px 64px",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: 11,
        lineHeight: 1.5,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div className="mb-5">
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, letterSpacing: -0.5 }}>
          {personal.full_name || "Your Name"}
        </h1>
        {contactLine && (
          <p style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>
            {contactLine}
          </p>
        )}
        {linksLine && (
          <p style={{ fontSize: 10, color: "#555" }}>{linksLine}</p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5">
          <SectionHeading>Summary</SectionHeading>
          <p style={{ fontSize: 11, color: "#333", lineHeight: 1.6 }}>
            {summary}
          </p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Education</SectionHeading>
          <div className="space-y-2">
            {education.map((e, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p style={{ fontWeight: 600, fontSize: 11 }}>{e.institution}</p>
                  <p style={{ fontSize: 10, color: "#555" }}>
                    {[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {(e.start_date || e.end_date) && (
                  <p style={{ fontSize: 10, color: "#777", whiteSpace: "nowrap", marginLeft: 16 }}>
                    {[e.start_date, e.end_date].filter(Boolean).join(" – ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Skills</SectionHeading>
          <p style={{ fontSize: 11, color: "#333", lineHeight: 1.8 }}>
            {skills.join("  ·  ")}
          </p>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Projects</SectionHeading>
          <div className="space-y-3">
            {projects.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <p style={{ fontWeight: 600, fontSize: 11 }}>{p.title}</p>
                  {p.url && (
                    <p style={{ fontSize: 10, color: "#666", marginLeft: 12 }}>
                      {p.url}
                    </p>
                  )}
                </div>
                {p.description && (
                  <p style={{ fontSize: 10, color: "#444", marginTop: 1, lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                )}
                {p.tech_stack.length > 0 && (
                  <p style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
                    {p.tech_stack.join("  ·  ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Certifications</SectionHeading>
          <div className="space-y-1">
            {certifications.map((c, i) => (
              <div key={i} className="flex justify-between">
                <p style={{ fontSize: 11 }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: "#666" }}>  ·  {c.issuer}</span>
                </p>
                {c.date && (
                  <p style={{ fontSize: 10, color: "#777" }}>{c.date}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
