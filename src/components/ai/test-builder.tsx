'use client';

import { useState } from 'react';
import { readPortalIdentity } from '../../lib/portal-session';

type Question = {
  type: string;
  text: string;
  options?: string[];
  answer: string;
  marks: number;
  explanation: string;
};

type GeneratedTest = {
  subject: string;
  classLevel: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  totalMarks: number;
  model: string;
  note: string;
};

const subjects = ['Mathematics', 'English Language', 'Basic Science', 'Computer Science', 'Business Studies', 'Design & Technology', 'Social Studies'];
const levels = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2'];
const typeOptions = [
  { id: 'mcq', label: 'Multiple choice' },
  { id: 'short', label: 'Short answer' },
  { id: 'theory', label: 'Theory' },
  { id: 'true_false', label: 'True / false' },
  { id: 'fill_blank', label: 'Fill in the blank' },
];

const inputClass = 'mt-1.5 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]';

export default function TestBuilder() {
  const [form, setForm] = useState({
    subject: 'Mathematics',
    classLevel: 'JSS 2',
    topic: 'Fractions and decimals',
    count: 5,
    difficulty: 'mixed',
    types: ['mcq', 'short'],
  });
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleType = (id: string) => {
    setForm(current => ({
      ...current,
      types: current.types.includes(id) ? current.types.filter(type => type !== id) : [...current.types, id],
    }));
  };

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const identity = readPortalIdentity();
      const response = await fetch('/api/ai/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: identity.email || 'teacher@bifti.school',
          role: identity.role || 'teacher',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate the test.');
      setTest(data);
      setStatus(`Draft generated with ${data.questions.length} questions · ${data.totalMarks} marks.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the test.');
    } finally {
      setBusy(false);
    }
  };

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    setTest(current => {
      if (!current) return current;
      const questions = current.questions.map((question, position) => (position === index ? { ...question, ...patch } : question));
      return { ...current, questions, totalMarks: questions.reduce((total, question) => total + Number(question.marks || 0), 0) };
    });
  };

  const asText = () => {
    if (!test) return '';
    const header = `${test.subject} — ${test.classLevel}\nTopic: ${test.topic}\nDifficulty: ${test.difficulty}\nTotal marks: ${test.totalMarks}\n\n`;
    return header + test.questions
      .map((question, index) => {
        const options = question.options?.length ? `\n   ${question.options.map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`).join('\n   ')}` : '';
        return `${index + 1}. (${question.type.replace('_', ' ')}, ${question.marks} mark${question.marks === 1 ? '' : 's'}) ${question.text}${options}\n   Answer: ${question.answer}\n   Marking note: ${question.explanation}`;
      })
      .join('\n\n');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Copying is blocked in this browser. Use download instead.');
    }
  };

  const download = () => {
    if (!test) return;
    const blob = new Blob([asText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${test.subject}-${test.classLevel}-${test.topic}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="rounded border border-[#d8dde4] bg-white">
        <div className="border-b border-[#eef1f4] px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[#2f3338]">Generate a draft test</h2>
          <p className="mt-1 text-[13px] text-[#6b7380]">Powered by the school AI engine. Always review and edit before publishing.</p>
        </div>
        <form onSubmit={generate} className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-[12px] font-semibold text-[#4a515a]">Subject
            <select value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} className={inputClass}>
              {subjects.map(subject => <option key={subject}>{subject}</option>)}
            </select>
          </label>
          <label className="text-[12px] font-semibold text-[#4a515a]">Class
            <select value={form.classLevel} onChange={event => setForm({ ...form, classLevel: event.target.value })} className={inputClass}>
              {levels.map(level => <option key={level}>{level}</option>)}
            </select>
          </label>
          <label className="text-[12px] font-semibold text-[#4a515a] sm:col-span-2">Topic
            <input required value={form.topic} onChange={event => setForm({ ...form, topic: event.target.value })} className={inputClass} />
          </label>
          <label className="text-[12px] font-semibold text-[#4a515a]">Questions
            <input type="number" min={1} max={15} value={form.count} onChange={event => setForm({ ...form, count: Number(event.target.value) })} className={inputClass} />
          </label>
          <label className="text-[12px] font-semibold text-[#4a515a]">Difficulty
            <select value={form.difficulty} onChange={event => setForm({ ...form, difficulty: event.target.value })} className={inputClass}>
              {['mixed', 'easy', 'medium', 'hard'].map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
          <div className="sm:col-span-2">
            <p className="text-[12px] font-semibold text-[#4a515a]">Question types</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {typeOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleType(option.id)}
                  aria-pressed={form.types.includes(option.id)}
                  className={`rounded border px-2.5 py-1.5 text-[11px] font-semibold ${form.types.includes(option.id) ? 'border-[#2e9fff] bg-[#f3f9ff] text-[#2e9fff]' : 'border-[#d8dde4] text-[#6b7380] hover:border-[#2e9fff]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={busy} className="rounded bg-[#2e9fff] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef] disabled:cursor-wait disabled:opacity-60">
              {busy ? 'Generating…' : 'Generate draft test'}
            </button>
            <span className="text-[11px] text-[#9aa3ad]">Uses the NVIDIA reasoning model · about 5–15 seconds.</span>
          </div>
          {error && <p className="sm:col-span-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{error}</p>}
          {status && <p className="sm:col-span-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">{status}</p>}
        </form>
      </div>

      {test && (
        <div className="rounded border border-[#d8dde4] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f4] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#2f3338]">{test.subject} · {test.classLevel}</h2>
              <p className="mt-1 text-[12px] text-[#6b7380]">{test.topic} · {test.questions.length} questions · {test.totalMarks} marks</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copy} className="rounded border border-[#d8dde4] px-3 py-2 text-[12px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">{copied ? 'Copied' : 'Copy test'}</button>
              <button type="button" onClick={download} className="rounded border border-[#d8dde4] px-3 py-2 text-[12px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Download .txt</button>
            </div>
          </div>
          <ol className="divide-y divide-[#eef1f4]">
            {test.questions.map((question, index) => (
              <li key={index} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#9aa3ad]">
                  <span>Question {index + 1}</span>
                  <span className="rounded bg-[#eef1f4] px-1.5 py-0.5 text-[#4a515a]">{question.type.replace('_', ' ')}</span>
                  <label className="ml-auto flex items-center gap-1 normal-case tracking-normal text-[#6b7380]">
                    Marks
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={question.marks}
                      onChange={event => updateQuestion(index, { marks: Number(event.target.value) })}
                      className="w-14 rounded border border-[#d8dde4] px-2 py-1 text-[12px]"
                    />
                  </label>
                </div>
                <textarea
                  value={question.text}
                  onChange={event => updateQuestion(index, { text: event.target.value })}
                  rows={2}
                  className="mt-2 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]"
                />
                {question.options?.length ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-2 text-[12px] text-[#6b7380]">
                        <span className="font-bold text-[#4a515a]">{String.fromCharCode(65 + optionIndex)}</span>
                        <input
                          value={option}
                          onChange={event => updateQuestion(index, {
                            options: question.options?.map((item, position) => (position === optionIndex ? event.target.value : item)),
                          })}
                          className="w-full rounded border border-[#d8dde4] px-2 py-1.5 text-[12px] text-[#2f3338]"
                        />
                      </label>
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="text-[11px] font-semibold text-[#6b7380]">Answer
                    <input value={question.answer} onChange={event => updateQuestion(index, { answer: event.target.value })} className="mt-1 w-full rounded border border-[#d8dde4] px-2 py-1.5 text-[12px] text-[#2f3338]" />
                  </label>
                  <label className="text-[11px] font-semibold text-[#6b7380]">Marking note
                    <input value={question.explanation} onChange={event => updateQuestion(index, { explanation: event.target.value })} className="mt-1 w-full rounded border border-[#d8dde4] px-2 py-1.5 text-[12px] text-[#2f3338]" />
                  </label>
                </div>
              </li>
            ))}
          </ol>
          <p className="border-t border-[#eef1f4] px-5 py-3 text-[11px] text-[#9aa3ad]">{test.note} Drafts are not visible to students until a teacher publishes them.</p>
        </div>
      )}
    </div>
  );
}
