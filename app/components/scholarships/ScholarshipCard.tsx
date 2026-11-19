import type { ScholarshipSummary } from "@/lib/scholarships/types";

type ScholarshipCardProps = {
  scholarship: ScholarshipSummary;
};

function formatDeadline(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return "Tanggal tidak valid";

  const [, year, month, day] = match;

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  // Prevent invalid dates from silently rolling over.
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return "Tanggal tidak valid";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatGpa(value: number): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getSafeUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

const verificationLabels = {
  verified: "Ditandai terverifikasi",
  unverified: "Belum terverifikasi",
  unknown: "Status verifikasi belum diketahui",
} as const;

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const {
    title,
    organizer,
    deadline,
    majors,
    minimumGpa,
    approved,
    sourceUrl,
    dataOrigin,
    sourceVerification,
    educationLevel,
    fundingType,
    description,
  } = scholarship;

  const safeUrl = getSafeUrl(sourceUrl);

  return (
    <article className="flex h-full min-w-0 flex-col gap-5 rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start gap-2">
        {dataOrigin === "simulated" && (
          <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-800">
            Data simulasi
          </span>
        )}

        {dataOrigin === "unknown" && (
          <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800">
            Asal data belum diketahui
          </span>
        )}

        <span className="rounded-lg border border-app-border px-3 py-1.5 text-xs font-medium text-neutral-700">
          {verificationLabels[sourceVerification]}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="break-word text-xl font-bold leading-snug text-app-text">
          {title}
        </h2>

        <p className="break-word text-sm text-neutral-600">{organizer}</p>
      </div>

      <dl className="grid grid-cols-1 gap-4 border-t border-app-border pt-5 min-[360px]:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs text-neutral-600">Deadline</dt>
          <dd className="font-semibold text-app-text">
            {formatDeadline(deadline)}
          </dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs text-neutral-600">Minimum IPK</dt>
          <dd className="font-semibold text-app-text">
            {formatGpa(minimumGpa)} / 4,00
          </dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-app-text">
          Jurusan yang diterima
        </h3>

        {majors.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {majors.map((major) => (
              <li
                key={major}
                className="max-w-full break-word rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-700"
              >
                {major}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-600">
            Informasi jurusan belum tersedia.
          </p>
        )}
      </div>

      {(educationLevel || fundingType || description) && (
        <div className="space-y-2 border-t border-app-border pt-4 text-sm text-neutral-700">
          {educationLevel && (
            <p>
              <strong>Jenjang:</strong> {educationLevel}
            </p>
          )}

          {fundingType && (
            <p>
              <strong>Pendanaan:</strong> {fundingType}
            </p>
          )}

          {description && (
            <p className="whitespace-pre-wrap break-word leading-6">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto space-y-3 border-t border-app-border pt-4">
        {!approved && (
          <p className="text-sm text-neutral-700">
            Record ini belum disetujui untuk publikasi.
          </p>
        )}

        {dataOrigin === "simulated" && (
          <p className="text-xs leading-5 text-neutral-600">
            Contoh data pengembangan, bukan pengumuman beasiswa resmi.
          </p>
        )}

        {safeUrl ? (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-app-text transition-colors hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-text"
          >
            Lihat sumber (tab baru)
          </a>
        ) : (
          <p className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-700">
            Tautan sumber belum tersedia
          </p>
        )}
      </div>
    </article>
  );
}
