import { Resend } from "resend";
import { render } from "@react-email/render";
import { NotificationEmail, type NotificationEmailProps } from "@/emails/notification";
import { WelcomeEmail, type WelcomeEmailProps } from "@/emails/welcome";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return _resend;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "notifications@platform.com";

const NOTIFICATION_SUBJECTS: Record<NotificationEmailProps["type"], string> = {
  comment: "New comment on your portfolio",
  dm: "You have a new message",
  team_match: "Someone wants to join your team",
  event_new: "New event matching your skills",
  forum_reply: "New reply on your forum post",
};

export async function sendNotificationEmail(
  to: string,
  props: NotificationEmailProps
): Promise<boolean> {
  try {
    const html = await render(NotificationEmail(props));
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: NOTIFICATION_SUBJECTS[props.type],
      html,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function sendWelcomeEmail(
  to: string,
  props: WelcomeEmailProps
): Promise<boolean> {
  try {
    const html = await render(WelcomeEmail(props));
    const appName = props.appName ?? "Profolio";
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ${appName}!`,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}
