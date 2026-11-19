"use client";

import { useState, type FormEvent } from "react";

type Source = {
  id: number;
  opportunityTitle: string;
  title: string;
  url: string | null;
  isVerified: boolean;
};

type AnswerResult = {
  question: string;
  answer: string;
  hasEnoughInformation: boolean;
  sources: Source[];
  verifiedSource: boolean;
};

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
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-indigo-600">APPLYFLOW AI</p>

          <h1 className="text-3xl font-bold">Ask ApplyFlow</h1>

          <p className="text-slate-600">
            Tanyakan persyaratan beasiswa berdasarkan dokumen yang tersedia.
            Sistem ini menggunakan data simulasi, bukan informasi resmi penyelenggara.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border
                     border-slate-200 bg-white p-6"
        >
          <label htmlFor="question" className="block text-sm font-medium">
            Pertanyaanmu
          </label>

          <textarea
            id="question"
            rows={4}
            maxLength={1000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Contoh: Berapa IPK minimum Beasiswa Teknologi?"
            className="w-full rounded-xl border
                       border-slate-300 p-4
                       focus:border-indigo-500
                       focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || question.trim().length < 5}
            className="rounded-xl bg-indigo-600 px-6 py-3
                       font-medium text-white
                       hover:bg-indigo-700
                       disabled:cursor-not-allowed
                       disabled:opacity-50"
          >
            {loading ? "Mencari jawaban..." : "Ask AI"}
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200
                       bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {result && (
          <section
            className="space-y-5 rounded-2xl border
                              border-slate-200 bg-white p-6"
          >
            <h2 className="text-xl font-semibold">Jawaban ApplyFlow</h2>

            <p className="whitespace-pre-wrap leading-7">{result.answer}</p>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Status informasi</p>

              <p className="text-sm text-slate-600">
                {result.hasEnoughInformation
                  ? "Informasi untuk menjawab pertanyaan tersedia."
                  : "Informasi belum cukup untuk menjawab secara pasti."}
              </p>

              {!result.verifiedSource && (
                <p
                  className="rounded-lg bg-amber-50
                              p-3 text-sm text-amber-800"
                >
                  Sumber belum diverifikasi secara resmi. Jangan gunakan sebagai
                  dasar pendaftaran tanpa memeriksa penyelenggara.
                </p>
              )}
            </div>

            <div
              className="space-y-3 border-t
                            border-slate-200 pt-5"
            >
              <h3 className="font-semibold">Referensi dokumen</h3>

              {result.sources.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Tidak ada referensi yang digunakan.
                </p>
              ) : (
                result.sources.map((source) => (
                  <div key={source.id} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-medium">{source.opportunityTitle}</p>

                    <p className="text-sm text-slate-600">{source.title}</p>

                    {source.url && /^https?:\/\//i.test(source.url) && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 underline"
                      >
                        Lihat dokumen sumber
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
