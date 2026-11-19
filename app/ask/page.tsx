"use client";

import { useState, type FormEvent } from "react";

import AnswerPanel from "../components/ai/AnswerPanel";
import type { AnswerResult } from "../../lib/ai/types";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (question.trim().length < 5) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ask-semantic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menghasilkan jawaban");
      }

      setResult(data as AnswerResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="scroll-mt-28 px-4 py-8 text-app-text sm:px-6 sm:py-12 lg:px-10 lg:scroll-mt-20"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold tracking-wide text-neutral-600">
            APPLYFLOW AI
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
            Ask about scholarships.
          </h1>

          <p className="max-w-2xl leading-7 text-neutral-600">
            Tanyakan informasi dan persyaratan beasiswa berdasarkan dokumen yang
            tersedia. Sistem saat ini menggunakan data simulasi, bukan
            pengumuman resmi penyelenggara.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm sm:p-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="question"
              className="block text-sm font-semibold text-app-text"
            >
              Pertanyaanmu
            </label>

            <p id="question-help" className="text-sm text-neutral-600">
              Tulis pertanyaan yang spesifik. Minimal 5 karakter, maksimal 1000
              karakter.
            </p>
          </div>

          <textarea
            id="question"
            rows={4}
            minLength={5}
            maxLength={1000}
            required
            aria-describedby="question-help question-count"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Contoh: Berapa IPK minimum Beasiswa Teknologi?"
            className={[
              "w-full resize-y rounded-xl border",
              "border-neutral-300 bg-white p-4",
              "text-base text-app-text",
              "placeholder:text-neutral-500",
              "focus-visible:outline-2",
              "focus-visible:outline-offset-2",
              "focus-visible:outline-app-text",
            ].join(" ")}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-neutral-600">
              Gunakan nama beasiswa jika tersedia.
            </p>

            <p
              id="question-count"
              className="shrink-0 text-xs tabular-nums text-neutral-600"
            >
              {question.length} / 1000
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || question.trim().length < 5}
            className={[
              "inline-flex min-h-11 w-full items-center",
              "justify-center rounded-xl",
              "bg-brand px-6 py-3",
              "font-semibold text-app-text",
              "transition-colors hover:bg-yellow-300",
              "focus-visible:outline-2",
              "focus-visible:outline-offset-2",
              "focus-visible:outline-app-text",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
              "sm:w-auto",
            ].join(" ")}
          >
            {loading ? "Mencari jawaban..." : "Ask AI"}
          </button>
        </form>

        <p role="status" className="min-h-5 text-sm text-neutral-600">
          {loading
            ? "Sedang mencari dokumen dan menyiapkan jawaban..."
            : result
              ? "Jawaban tersedia di bawah formulir."
              : ""}
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {result && <AnswerPanel result={result} />}
      </div>
    </main>
  );
}
