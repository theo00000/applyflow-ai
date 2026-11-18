"use client";

import { useState, type FormEvent } from "react";

type Recommendation = {
  id: number;
  title: string;
  majors: string[];
  minimumGpa: number;
  deadline: string;
  approved: boolean;
  explanation: string;
  explanationSource: "llm" | "fallback";
};

type RecommendationResponse = {
  count: number;
  recommendations: Recommendation[];
  verifiedSource: boolean;
};

type ApiError = {
  error: string;
};

function formatDeadline(deadline: string) {
  const [year, month, day] = deadline.split("-");
  return `${day}/${month}/${year}`;
}

export default function Home() {
  // 1. Form state
  const [major, setMajor] = useState("Informatika");
  const [gpa, setGpa] = useState("3.8");

  // 2. API state
  const [data, setData] = useState<RecommendationResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Submit handler
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError(null);
    setData(null);

    const studentGpa = Number(gpa);

    // Client-side validation
    if (
      !major.trim() ||
      !gpa.trim() ||
      !Number.isFinite(studentGpa) ||
      studentGpa < 0 ||
      studentGpa > 4
    ) {
      setError("Masukkan jurusan dan IPK yang valid (0–4).");
      return;
    }

    setLoading(true);

    try {
      // 4. Call our own Next.js backend
      const response = await fetch("/api/ai-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          major: major.trim(),
          gpa: studentGpa,
        }),
        cache: "no-store",
      });

      const result: RecommendationResponse | ApiError = await response.json();

      if (!response.ok) {
        throw new Error(
          "error" in result ? result.error : "Terjadi kesalahan pada server.",
        );
      }

      if (
        !("recommendations" in result) ||
        !Array.isArray(result.recommendations)
      ) {
        throw new Error("Format respons API tidak sesuai.");
      }

      // 5. Store response in React state
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil rekomendasi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-5 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
            ✨ ApplyFlow AI Advisor
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Find your next opportunity.
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Temukan peluang yang sesuai dengan profil akademikmu, disertai
            penjelasan yang dihasilkan oleh AI.
          </p>
        </header>

        {/* Student Profile Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Academic Profile</h2>

          <p className="mt-1 text-sm text-slate-500">
            Masukkan informasi akademik untuk mendapatkan rekomendasi.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="major" className="mb-2 block text-sm font-medium">
                Jurusan
              </label>

              <input
                id="major"
                type="text"
                value={major}
                onChange={(event) => setMajor(event.target.value)}
                maxLength={100}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Contoh: Informatika"
              />
            </div>

            <div>
              <label htmlFor="gpa" className="mb-2 block text-sm font-medium">
                IPK (GPA)
              </label>

              <input
                id="gpa"
                type="number"
                min="0"
                max="4"
                step="0.01"
                required
                value={gpa}
                onChange={(event) => setGpa(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Contoh: 3.8"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "AI sedang menganalisis..."
                : "✨ Get AI Recommendations"}
            </button>
          </form>
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div
            role="status"
            className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-8"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />

            <p className="text-slate-600">
              Memproses rekomendasi melalui AI...
            </p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <section className="mt-10" aria-live="polite">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Your Recommendations</h2>

                <p className="mt-1 text-slate-500">
                  {data.count} peluang memenuhi filter akademik.
                </p>
              </div>

              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
                AI Powered
              </span>
            </div>

            {!data.verifiedSource && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Data masih berupa simulasi dan belum diverifikasi dari
                penyelenggara resmi.
              </div>
            )}

            {data.recommendations.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Belum ditemukan peluang yang memenuhi kriteria. Coba profil lain
                atau tambahkan dataset.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {data.recommendations.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">{item.title}</h3>

                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Eligible*
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <p>
                        <strong>Minimum IPK:</strong> {item.minimumGpa}
                      </p>

                      <p>
                        <strong>Deadline:</strong>{" "}
                        {formatDeadline(item.deadline)}
                      </p>

                      <p>
                        <strong>Jurusan:</strong> {item.majors.join(", ")}
                      </p>
                    </div>

                    <div className="mt-5 rounded-xl bg-indigo-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-indigo-700">
                        ✨ AI Explanation
                      </p>

                      <p className="text-sm leading-relaxed text-slate-700">
                        {item.explanation}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        Source: {item.explanationSource}
                      </p>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      *Eligible hanya berdasarkan kriteria dalam dataset
                      simulasi.
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
