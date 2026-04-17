import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/pdf";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 56,
    paddingRight: 56,
    lineHeight: 1.4,
  },
  // Header
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  contactLine: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 2,
  },
  // Section
  sectionContainer: {
    marginBottom: 14,
  },
  sectionHeader: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#666666",
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
    paddingBottom: 2,
    marginBottom: 6,
  },
  // Education
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  institutionName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  subtext: {
    fontSize: 9,
    color: "#555555",
    marginTop: 1,
  },
  dateText: {
    fontSize: 9,
    color: "#777777",
    marginLeft: 8,
    flexShrink: 0,
  },
  // Skills
  skillsText: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.7,
  },
  // Projects
  projectContainer: {
    marginBottom: 8,
  },
  projectTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  projectUrl: {
    fontSize: 9,
    color: "#666666",
    marginLeft: 8,
    flexShrink: 0,
  },
  projectDesc: {
    fontSize: 9,
    color: "#444444",
    marginTop: 1,
    lineHeight: 1.5,
  },
  projectTech: {
    fontSize: 9,
    color: "#666666",
    marginTop: 2,
  },
  // Certifications
  certRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  certName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  certIssuer: {
    fontSize: 10,
    color: "#666666",
  },
  certDate: {
    fontSize: 9,
    color: "#777777",
    marginLeft: 8,
    flexShrink: 0,
  },
});

function joinContact(items: string[]) {
  return items.filter(Boolean).join("  ·  ");
}

export function ClassicPDFTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, education, skills, projects, certifications } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.name}>{personal.full_name || "Your Name"}</Text>
          {joinContact([personal.email, personal.phone, personal.location]) ? (
            <Text style={styles.contactLine}>
              {joinContact([personal.email, personal.phone, personal.location])}
            </Text>
          ) : null}
          {joinContact([personal.github, personal.linkedin, personal.website]) ? (
            <Text style={styles.contactLine}>
              {joinContact([personal.github, personal.linkedin, personal.website])}
            </Text>
          ) : null}
        </View>

        {/* Summary */}
        {summary ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Summary</Text>
            <Text style={{ fontSize: 10, color: "#333333", lineHeight: 1.6 }}>{summary}</Text>
          </View>
        ) : null}

        {/* Education */}
        {education.length > 0 ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((e, i) => (
              <View key={i} style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.institutionName}>{e.institution}</Text>
                  <Text style={styles.subtext}>
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

        {/* Skills */}
        {skills.length > 0 ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Skills</Text>
            <Text style={styles.skillsText}>{skills.join("  ·  ")}</Text>
          </View>
        ) : null}

        {/* Projects */}
        {projects.length > 0 ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Projects</Text>
            {projects.map((p, i) => (
              <View key={i} style={styles.projectContainer}>
                <View style={styles.rowBetween}>
                  <Text style={styles.projectTitle}>{p.title}</Text>
                  {p.url ? <Text style={styles.projectUrl}>{p.url}</Text> : null}
                </View>
                {p.description ? (
                  <Text style={styles.projectDesc}>{p.description}</Text>
                ) : null}
                {p.tech_stack.length > 0 ? (
                  <Text style={styles.projectTech}>{p.tech_stack.join("  ·  ")}</Text>
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
                  <Text style={styles.certName}>{c.name}</Text>
                  <Text style={styles.certIssuer}>  ·  {c.issuer}</Text>
                </View>
                {c.date ? <Text style={styles.certDate}>{c.date}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
