import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/pdf";

const SIDEBAR_BG = "#1e293b";
const SIDEBAR_TEXT = "#e2e8f0";
const SIDEBAR_MUTED = "#94a3b8";
const SIDEBAR_LABEL = "#64748b";
const SKILL_BG = "#334155";
const SKILL_TEXT = "#cbd5e1";
const TAG_BG = "#f1f5f9";
const TAG_TEXT = "#475569";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  sidebar: {
    width: 180,
    minHeight: "100%",
    backgroundColor: SIDEBAR_BG,
    padding: "44 18",
  },
  sidebarName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: "#f1f5f9",
    lineHeight: 1.2,
    marginBottom: 20,
  },
  sidebarSectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: SIDEBAR_LABEL,
    marginBottom: 8,
  },
  contactBlock: {
    marginBottom: 20,
  },
  contactItemLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: SIDEBAR_MUTED,
    marginBottom: 1,
  },
  contactItemValue: {
    fontSize: 8,
    color: SIDEBAR_TEXT,
    marginBottom: 5,
  },
  skillsBlock: {},
  skillBadge: {
    backgroundColor: SKILL_BG,
    color: SKILL_TEXT,
    fontSize: 8,
    borderRadius: 2,
    padding: "2 5",
    marginRight: 3,
    marginBottom: 3,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  // Main content
  main: {
    flex: 1,
    padding: "44 30",
    backgroundColor: "#ffffff",
  },
  sectionContainer: {
    marginBottom: 14,
  },
  sectionHeader: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#64748b",
    borderBottomWidth: 0.75,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 2,
    marginBottom: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bold: { fontFamily: "Helvetica-Bold", fontSize: 10, color: "#111111" },
  muted: { fontSize: 9, color: "#6b7280", marginTop: 1 },
  dateText: { fontSize: 9, color: "#9ca3af", marginLeft: 8, flexShrink: 0 },
  bodyText: { fontSize: 10, color: "#374151", lineHeight: 1.6 },
  projectContainer: { marginBottom: 8 },
  projectUrl: { fontSize: 8, color: "#6b7280", marginLeft: 8, flexShrink: 0 },
  projectDesc: { fontSize: 9, color: "#4b5563", marginTop: 2, lineHeight: 1.5 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 3 },
  tag: {
    backgroundColor: TAG_BG,
    color: TAG_TEXT,
    fontSize: 8,
    borderRadius: 2,
    padding: "1 4",
    marginRight: 3,
    marginBottom: 2,
  },
  certRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  certDate: { fontSize: 9, color: "#9ca3af", marginLeft: 8, flexShrink: 0 },
});

function ContactItem({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View>
      <Text style={styles.contactItemLabel}>{label}</Text>
      <Text style={styles.contactItemValue}>{value}</Text>
    </View>
  );
}

export function ModernPDFTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, education, skills, projects, certifications } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarName}>{personal.full_name || "Your Name"}</Text>

          <View style={styles.contactBlock}>
            <Text style={styles.sidebarSectionLabel}>Contact</Text>
            <ContactItem label="Email" value={personal.email} />
            <ContactItem label="Phone" value={personal.phone} />
            <ContactItem label="Location" value={personal.location} />
            <ContactItem label="LinkedIn" value={personal.linkedin} />
            <ContactItem label="GitHub" value={personal.github} />
            <ContactItem label="Website" value={personal.website} />
          </View>

          {skills.length > 0 ? (
            <View style={styles.skillsBlock}>
              <Text style={styles.sidebarSectionLabel}>Skills</Text>
              <View style={styles.skillsWrap}>
                {skills.map((s, i) => (
                  <Text key={i} style={styles.skillBadge}>{s}</Text>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Main content */}
        <View style={styles.main}>
          {/* Summary */}
          {summary ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Summary</Text>
              <Text style={styles.bodyText}>{summary}</Text>
            </View>
          ) : null}

          {/* Education */}
          {education.length > 0 ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Education</Text>
              {education.map((e, i) => (
                <View key={i} style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bold}>{e.institution}</Text>
                    <Text style={styles.muted}>
                      {[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
                    </Text>
                  </View>
                  {(e.start_date || e.end_date) ? (
                    <Text style={styles.dateText}>
                      {[e.start_date, e.end_date].filter(Boolean).join(" – ")}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Projects */}
          {projects.length > 0 ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Projects</Text>
              {projects.map((p, i) => (
                <View key={i} style={styles.projectContainer}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bold}>{p.title}</Text>
                    {p.url ? <Text style={styles.projectUrl}>{p.url}</Text> : null}
                  </View>
                  {p.description ? (
                    <Text style={styles.projectDesc}>{p.description}</Text>
                  ) : null}
                  {p.tech_stack.length > 0 ? (
                    <View style={styles.tagWrap}>
                      {p.tech_stack.map((t, ti) => (
                        <Text key={ti} style={styles.tag}>{t}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Certifications */}
          {certifications.length > 0 ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Certifications</Text>
              {certifications.map((c, i) => (
                <View key={i} style={styles.certRow}>
                  <View style={{ flexDirection: "row", flex: 1 }}>
                    <Text style={styles.bold}>{c.name}</Text>
                    <Text style={{ fontSize: 10, color: "#6b7280" }}>  ·  {c.issuer}</Text>
                  </View>
                  {c.date ? <Text style={styles.certDate}>{c.date}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
