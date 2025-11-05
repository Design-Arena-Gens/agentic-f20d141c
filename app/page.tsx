"use client";

import { useMemo, useState } from 'react';

type Persona = 'general' | 'career' | 'finance' | 'fitness' | 'relationships' | 'wellness';

interface AdvisorRequestBody {
  name: string;
  age?: number | '';
  persona: Persona;
  goals: string;
  context: string;
  question: string;
}

export default function HomePage() {
  const [form, setForm] = useState<AdvisorRequestBody>({
    name: '',
    age: '',
    persona: 'general',
    goals: '',
    context: '',
    question: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string>('');

  const disabled = useMemo(() => {
    return !form.name || !form.goals || !form.question || loading;
  }, [form, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResponse('');
    setLoading(true);
    try {
      const res = await fetch('/api/advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: form.age === '' ? undefined : Number(form.age),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Request failed');
      }
      const data = (await res.json()) as { message: string };
      setResponse(data.message);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <form onSubmit={handleSubmit} className="form">
        <div className="grid">
          <label>
            <span>Name</span>
            <input
              type="text"
              placeholder="Alex"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            <span>Age</span>
            <input
              type="number"
              min={0}
              placeholder="30"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value as any })}
            />
          </label>
        </div>

        <label>
          <span>Advisor Persona</span>
          <select
            value={form.persona}
            onChange={(e) => setForm({ ...form, persona: e.target.value as any })}
          >
            <option value="general">General</option>
            <option value="career">Career</option>
            <option value="finance">Finance</option>
            <option value="fitness">Fitness</option>
            <option value="relationships">Relationships</option>
            <option value="wellness">Wellness</option>
          </select>
        </label>

        <label>
          <span>Your Goals</span>
          <textarea
            placeholder="E.g., get a promotion, save $10k, run 5k, improve relationships"
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
            rows={3}
          />
        </label>

        <label>
          <span>Relevant Context (optional)</span>
          <textarea
            placeholder="Constraints, habits, timeline, skills, finances, etc."
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            rows={3}
          />
        </label>

        <label>
          <span>Your Question</span>
          <textarea
            placeholder="What should I focus on first? What is my 4-week plan?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            rows={4}
          />
        </label>

        <div className="row">
          <button type="submit" disabled={disabled}>
            {loading ? 'Thinking?' : 'Get Advice'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setForm({ name: '', age: '', persona: 'general', goals: '', context: '', question: '' });
              setResponse('');
              setError(null);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}
      {response && (
        <article className="result">
          <h2>Your Personalized Advice</h2>
          <pre>{response}</pre>
        </article>
      )}

      <details className="help">
        <summary>Need ideas?</summary>
        <div>
          <p><strong>Goals</strong>: "Earn a promotion to Senior Engineer in 12 months; Improve fitness; Save for a home down payment."</p>
          <p><strong>Question</strong>: "What should I do over the next 4 weeks to make meaningful progress?"</p>
        </div>
      </details>
    </section>
  );
}
