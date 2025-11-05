import { NextResponse } from 'next/server';
import { generateAdviceLocal } from '../../../lib/advisor';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      age?: number;
      persona: 'general' | 'career' | 'finance' | 'fitness' | 'relationships' | 'wellness';
      goals: string;
      context?: string;
      question: string;
    };

    if (!body?.name || !body?.goals || !body?.question) {
      return NextResponse.json({ message: 'Missing required fields: name, goals, question' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey) {
      const prompt = buildPrompt(body);
      try {
        const message = await callOpenAI(openaiKey, prompt);
        return NextResponse.json({ message });
      } catch (err) {
        // Fallback to local if OpenAI fails
        const message = generateAdviceLocal(body);
        return NextResponse.json({ message, note: 'OpenAI failed; fallback used' });
      }
    }

    const message = generateAdviceLocal(body);
    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message ?? 'Unexpected error' }, { status: 500 });
  }
}

function buildPrompt(b: {
  name: string;
  age?: number;
  persona: 'general' | 'career' | 'finance' | 'fitness' | 'relationships' | 'wellness';
  goals: string;
  context?: string;
  question: string;
}) {
  return `You are a world-class ${b.persona} personal advisor.
User profile:
- Name: ${b.name}
- Age: ${b.age ?? 'n/a'}
- Goals: ${b.goals}
- Context: ${b.context || 'n/a'}

Question: ${b.question}

Respond with:
1) A short diagnosis (2-3 sentences)
2) A prioritized action plan for 4 weeks (bulleted, weekly)
3) Risks and mitigations
4) Metrics to track
`;
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You provide pragmatic, step-by-step, concise, and kind advice.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'OpenAI API error');
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content from OpenAI');
  return content.trim();
}
