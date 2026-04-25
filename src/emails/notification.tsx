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

export type NotificationType =
  | "comment"
  | "dm"
  | "team_match"
  | "event_new"
  | "forum_reply";

export type NotificationEmailProps = {
  type: NotificationType;
  recipientName: string;
  title: string;
  body: string;
  link: string;
  appName?: string;
};

const TYPE_CONFIG: Record<
  NotificationType,
  { accent: string; emoji: string; label: string }
> = {
  comment: {
    accent: "#3b82f6",
    emoji: "💬",
    label: "New Comment",
  },
  dm: {
    accent: "#8b5cf6",
    emoji: "✉️",
    label: "New Message",
  },
  team_match: {
    accent: "#10b981",
    emoji: "👥",
    label: "Team Interest",
  },
  event_new: {
    accent: "#f59e0b",
    emoji: "📅",
    label: "New Event",
  },
  forum_reply: {
    accent: "#06b6d4",
    emoji: "💬",
    label: "Forum Reply",
  },
};

const CTА_LABEL: Record<NotificationType, string> = {
  comment: "View Comment",
  dm: "Open Message",
  team_match: "View Team Post",
  event_new: "View Event",
  forum_reply: "View Thread",
};

export function NotificationEmail({
  type,
  recipientName,
  title,
  body,
  link,
  appName = "Profolio",
}: NotificationEmailProps) {
  const config = TYPE_CONFIG[type];

  return (
    <Html lang="en">
      <Head />
      <Preview>{title}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>{appName}</Text>
          </Section>

          {/* Type badge */}
          <Section style={{ ...styles.badgeSection, borderTopColor: config.accent }}>
            <Text style={styles.badge}>
              {config.emoji}&nbsp;&nbsp;{config.label}
            </Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {recipientName},</Text>
            <Heading as="h1" style={styles.title}>
              {title}
            </Heading>
            <Text style={styles.bodyText}>{body}</Text>
            <Button href={link} style={{ ...styles.button, backgroundColor: config.accent }}>
              {CTА_LABEL[type]}
            </Button>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this notification because you have email alerts
              enabled. You can manage your preferences in your account settings.
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
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
    margin: 0,
  },
  badgeSection: {
    borderTop: "3px solid #3b82f6",
    padding: "16px 32px 0",
  },
  badge: {
    color: "#71717a",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    margin: 0,
    textTransform: "uppercase",
  },
  content: {
    padding: "16px 32px 32px",
  },
  greeting: {
    color: "#71717a",
    fontSize: "14px",
    margin: "0 0 8px",
  },
  title: {
    color: "#18181b",
    fontSize: "20px",
    fontWeight: "600",
    lineHeight: "1.3",
    margin: "0 0 12px",
  },
  bodyText: {
    color: "#52525b",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  button: {
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "500",
    padding: "10px 20px",
    textDecoration: "none",
  },
  hr: {
    borderColor: "#f4f4f5",
    margin: "0 32px",
  },
  footer: {
    padding: "16px 32px",
  },
  footerText: {
    color: "#a1a1aa",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: 0,
  },
};
