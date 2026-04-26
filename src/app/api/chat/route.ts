import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const coreMessages = (messages as Array<{
    role: string;
    parts?: Array<{ type: string; text?: string }>;
    content?: string;
  }>)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.parts
        ? m.parts.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('')
        : (m.content ?? ''),
    }));

  const result = streamText({
    model: groq('llama-3.1-8b-instant'),
    system: `You are a helpful and friendly AI assistant for Profolio, an online platform for student portfolios, networking, and career building.
    Your goal is to help users navigate the platform, give advice on structuring resumes/portfolios, and answer general questions.
    Keep your answers concise, professional, and encouraging.
    If asked about platform features, mention they can build portfolios, view a job board, engage in forums, and chat with peers/recruiters.
    Use Markdown to format your responses where helpful (e.g., bolding, bullet points).`,
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
}
