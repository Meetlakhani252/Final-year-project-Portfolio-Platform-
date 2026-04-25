import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export type WelcomeEmailProps = {
  fullName: string;
  role: "student" | "recruiter" | "organizer";
  dashboardUrl: string;
  appName?: string;
};

const ROLE_CONTENT: Record<
  WelcomeEmailProps["role"],
  { headline: string; description: string; ctaLabel: string }
> = {
  student: {
    headline: "Your portfolio is ready to shine.",
    description:
      "Build your portfolio, showcase projects, connect with teammates, and get discovered by recruiters — all in one place. Start by completing your profile.",
    ctaLabel: "Set Up My Portfolio",
  },
  recruiter: {
    headline: "Start discovering top talent.",
    description:
      "Explore student portfolios, bookmark candidates, and reach out directly through our messaging system. Your talent pipeline starts here.",
    ctaLabel: "Discover Students",
  },
  organizer: {
    headline: "Ready to host your next event?",
    description:
      "Create hackathons, workshops, and academic events. Students with matching skills get notified automatically so you always have an engaged audience.",
    ctaLabel: "Create an Event",
  },
};

export function WelcomeEmail({
  fullName,
  role,
  dashboardUrl,
  appName = "Profolio",
}: WelcomeEmailProps) {
  const content = ROLE_CONTENT[role];
  const firstName = fullName.split(" ")[0];

  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to {appName} — {content.headline}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>{appName}</Text>
            <Text style={styles.tagline}>Showcase Your Journey. Shape Your Future.</Text>
          </Section>

          {/* Hero */}
          <Section style={styles.hero}>
            <Text style={styles.welcomeBadge}>🎉 Welcome aboard</Text>
            <Heading as="h1" style={styles.heroTitle}>
              Hi {firstName}, welcome to {appName}!
            </Heading>
            <Text style={styles.heroSubtitle}>{content.headline}</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.bodyText}>{content.description}</Text>
            <Button href={dashboardUrl} style={styles.button}>
              {content.ctaLabel} →
            </Button>
          </Section>

          {/* Feature highlights */}
          {role === "student" && (
            <Section style={styles.features}>
              <Text style={styles.featuresTitle}>What you can do:</Text>
              {[
                "🗂️  Showcase projects, skills & certifications",
                "📝  Write blog posts to share your knowledge",
                "💬  Join forum discussions with peers",
                "🤝  Find teammates for hackathons & projects",
                "📅  Discover events that match your skills",
              ].map((item) => (
                <Text key={item} style={styles.featureItem}>
                  {item}
                </Text>
              ))}
            </Section>
          )}

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Questions? Reply to this email or visit your dashboard for help.
            </Text>
            <Text style={styles.footerText}>
              You received this because you created an account on {appName}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e4e4e7",
    margin: "40px auto",
    maxWidth: "520px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#18181b",
    padding: "20px 32px",
  },
  logo: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
    margin: "0 0 2px",
  },
  tagline: {
    color: "#a1a1aa",
    fontSize: "12px",
    margin: 0,
  },
  hero: {
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #f4f4f5",
    padding: "32px",
  },
  welcomeBadge: {
    color: "#71717a",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    margin: "0 0 10px",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#18181b",
    fontSize: "22px",
    fontWeight: "700",
    lineHeight: "1.3",
    margin: "0 0 10px",
  },
  heroSubtitle: {
    color: "#52525b",
    fontSize: "15px",
    lineHeight: "1.5",
    margin: 0,
  },
  hr: {
    borderColor: "#f4f4f5",
    margin: "0 32px",
  },
  content: {
    padding: "28px 32px",
  },
  bodyText: {
    color: "#52525b",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  button: {
    backgroundColor: "#18181b",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "500",
    padding: "11px 22px",
    textDecoration: "none",
  },
  features: {
    backgroundColor: "#fafafa",
    borderTop: "1px solid #f4f4f5",
    padding: "20px 32px 24px",
  },
  featuresTitle: {
    color: "#18181b",
    fontSize: "13px",
    fontWeight: "600",
    margin: "0 0 12px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  featureItem: {
    color: "#52525b",
    fontSize: "14px",
    lineHeight: "1.4",
    margin: "0 0 6px",
  },
  footer: {
    padding: "16px 32px",
  },
  footerText: {
    color: "#a1a1aa",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0 0 4px",
  },
};
