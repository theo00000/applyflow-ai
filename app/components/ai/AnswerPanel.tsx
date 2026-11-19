import type { AnswerResult } from "@/lib/ai/types";
import SourceCitation from "./SourceCitation";

type AnswerPanelProps = {
  result: AnswerResult;
};

export default function AnswerPanel({ result }: AnswerPanelProps) {
  const hasSources = result.sources.length > 0;

  const allSourcesVerified =
    hasSources &&
    result.verifiedSource &&
    result.sources.every((source) => source.isVerified);

  const verificationMessage = !hasSources
    ? "Tidak ada referensi yang digunakan."
    : allSourcesVerified
      ? "Semua referensi ditandai terverifikasi dalam sistem."
      : "Verifikasi seluruh referensi belum dapat dipastikan.";

  return (
    <section
      id="answer-result"
      aria-labelledby="answer-heading"
      className="space-y-6 rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm sm:p-6"
    >
      <div className="space-y-3">
        <h2 id="answer-heading" className="text-xl font-bold text-app-text">
          Jawaban ApplyFlow
        </h2>

        <p className="whitespace-pre-wrap break-word leading-7 text-app-text">
          {result.answer}
        </p>
      </div>

      <div
        aria-labelledby="evidence-heading"
        className="space-y-3 border-t border-app-border pt-5"
      >
        <h3 id="evidence-heading" className="font-semibold text-app-text">
          Status Informasi
        </h3>

        <div className="rounded-xl border border-app-border bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-app-text">
            Kecukupan informasi
          </p>

          <p className="mt-1 text-sm leading-6 text-neutral-700">
            {result.hasEnoughInformation
              ? "Sistem menilai informasi yang tersedia cukup untuk menjawab pertanyaan."
              : "Informasi belum cukup untuk memberikan jawaban yang pasti."}
          </p>
        </div>

        <div className="rounded-xl border border-app-border bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-app-text">
            Verifikasi sumber
          </p>

          <p className="mt-1 text-sm leading-6 text-neutral-700">
            {verificationMessage}
          </p>
        </div>

        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Informasi beasiswa saat ini menggunakan data simulasi. Status
          verifikasi dalam sistem tidak otomatis berarti informasi merupakan
          pengumuman resmi penyelenggara.
        </p>
      </div>

      <div className="space-y-4 border-t border-app-border pt-5">
        <h3 className="font-semibold text-app-text">Referensi Dokumen</h3>

        {hasSources ? (
          <ul className="space-y-3">
            {result.sources.map((source) => (
              <SourceCitation key={source.id} source={source} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-600">
            Belum ada dokumen referensi yang dapat ditampilkan untuk respons
            ini.
          </p>
        )}
      </div>
    </section>
  );
}
