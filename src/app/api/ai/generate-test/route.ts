import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, extractJson, runAI } from '../../../../lib/ai/engine';
import { aiProviderStatus } from '../../../../lib/ai/providers';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Question = {
  type: 'mcq' | 'short' | 'theory' | 'true_false' | 'fill_blank';
  text: string;
  options?: string[];
  answer: string;
  marks: number;
  explanation: string;
};

const TYPES = ['mcq', 'short', 'theory', 'true_false', 'fill_blank'] as const;

function validate(payload: unknown, expected: number): { questions: Question[]; totalMarks: number } {
  if (!payload || typeof payload !== 'object') throw new Error('The AI reply was not an object.');
  const raw = (payload as { questions?: unknown }).questions;
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('The AI reply had no questions.');

  const questions: Question[] = raw.slice(0, expected).map((item, index) => {
    const row = item as Record<string, unknown>;
    const type = String(row.type || '').toLowerCase().replace(/[\s-]+/g, '_');
    const text = String(row.text || '').trim();
    const answer = String(row.answer || '').trim();
    const explanation = String(row.explanation || '').trim();
    const marks = Math.max(1, Math.min(20, Number(row.marks) || 1));
    // Accept a few common aliases for true/false and fill-in-the-blank.
    const normalizedType = (TYPES as readonly string[]).includes(type)
      ? (type as Question['type'])
      : type === 'truefalse'
        ? 'true_false'
        : type === 'fill'
          ? 'fill_blank'
          : 'short';
    if (!text || !answer) throw new Error(`Question ${index + 1} was incomplete.`);

    const options = Array.isArray(row.options) ? row.options.map(option => String(option).trim()).filter(Boolean) : undefined;
    if (normalizedType === 'mcq' && (!options || options.length < 2)) {
      throw new Error(`Question ${index + 1} needs at least two options.`);
    }

    return { type: normalizedType, text, options, answer, marks, explanation };
  });

  return { questions, totalMarks: questions.reduce((total, question) => total + question.marks, 0) };
}

export async function POST(request: NextRequest) {
  const status = aiProviderStatus();
  if (!status.nvidia && !status.cloudflare) {
    return NextResponse.json({ error: 'AI is not configured on the server.', configured: false }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      role?: string;
      subject?: string;
      classLevel?: string;
      topic?: string;
      count?: number;
      difficulty?: string;
      types?: string[];
    };

    const email = (body.email || '').trim().toLowerCase();
    const role = (body.role || '').toLowerCase();
    if (!email.includes('@') || !['teacher', 'examiner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Only signed-in teaching staff can generate tests.' }, { status: 403 });
    }

    const subject = (body.subject || '').trim();
    const classLevel = (body.classLevel || '').trim();
    const topic = (body.topic || '').trim();
    const count = Math.max(1, Math.min(15, Number(body.count) || 5));
    const difficulty = ['easy', 'medium', 'hard', 'mixed'].includes((body.difficulty || '').toLowerCase())
      ? (body.difficulty || '').toLowerCase()
      : 'mixed';
    const requestedTypes = (body.types || []).filter(type => (TYPES as readonly string[]).includes(type));
    const types = requestedTypes.length ? requestedTypes : ['mcq', 'short'];

    if (!subject || !classLevel || !topic) {
      return NextResponse.json({ error: 'Subject, class level and topic are required.' }, { status: 400 });
    }

    const limit = checkRateLimit(email, 'test_generation');
    if (!limit.allowed) {
      return NextResponse.json({ error: `Daily test-generation limit reached (${limit.limit}).` }, { status: 429 });
    }

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an experienced Nigerian secondary-school examiner. Reply with VALID JSON only, no markdown. ' +
          'Questions must be accurate, age-appropriate and solvable. Every question needs a worked explanation.',
      },
      {
        role: 'user' as const,
        content:
          `Create ${count} ${difficulty} questions for ${classLevel} ${subject} on the topic "${topic}".\n` +
          `Allowed question types: ${types.join(', ')}.\n` +
          'JSON shape: {"questions":[{"type":"mcq|short|theory|true_false|fill_blank","text":"","options":[""],"answer":"","marks":1,"explanation":""}]}\n' +
          'For mcq include 4 options and set answer to the exact correct option text. For true_false answer must be "True" or "False".',
      },
    ];

    let parsed: { questions: Question[]; totalMarks: number };
    try {
      const raw = await runAI('test_generation', messages, {
        userId: email,
        temperature: 0.35,
        maxTokens: 2200,
        json: true,
      });
      parsed = validate(extractJson(raw.text), count);
    } catch (firstError) {
      // One repair attempt with the validation message so teachers are not shown a failed run.
      const retry = await runAI(
        'test_generation',
        [
          messages[0],
          messages[1],
          {
            role: 'user' as const,
            content: `Your previous reply failed validation: ${firstError instanceof Error ? firstError.message : 'bad JSON'}. Return corrected JSON only.`,
          },
        ],
        { userId: email, temperature: 0.2, maxTokens: 2200, json: true },
      );
      parsed = validate(extractJson(retry.text), count);
    }

    return NextResponse.json({
      subject,
      classLevel,
      topic,
      difficulty,
      questions: parsed.questions,
      totalMarks: parsed.totalMarks,
      model: status.models.reasoning,
      note: 'Draft only — review and edit every question before publishing to students.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not generate the test.' },
      { status: 502 },
    );
  }
}
