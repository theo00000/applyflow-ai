import type { Source } from "@/lib/ai/types";

type SourceCitationProps = {
  source: Source;
};

function getSafeSourceUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

export default function SourceCitation({ source }: SourceCitationProps) {
  const safeUrl = getSafeSourceUrl(source.url);

  return (
    <li className="rounded-xl border border-app-border bg-neutral-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-word font-semibold text-app-text">
            {source.opportunityTitle}
          </p>

          <p className="mt-1 break-word text-sm text-neutral-600">
            {source.title}
          </p>
        </div>

        <span className="self-start rounded-lg border border-app-border bg-white px-3 py-1.5 text-xs font-medium text-app-text">
          {source.isVerified ? "Ditandai terverifikasi" : "Belum terverifikasi"}
        </span>
      </div>

      {safeUrl ? (
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block break-word text-sm font-semibold text-app-text underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-text"
        >
          Buka {source.title} (tab baru)
        </a>
      ) : (
        <p className="mt-4 text-sm text-neutral-600">
          Tautan dokumen tidak tersedia.
        </p>
      )}
    </li>
  );
}
