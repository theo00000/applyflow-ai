import { notFound } from "next/navigation";

import ScholarshipCard from "../../components/scholarships/ScholarshipCard";
import { developmentScholarships } from "../../../lib/scholarships/dev-fixtures";

export default function ScholarshipCardPreview() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6"
    >
      <header className="mb-8 space-y-2">
        <p className="text-sm font-semibold text-neutral-600">
          COMPONENT PREVIEW
        </p>

        <h1 className="text-3xl font-bold">ScholarshipCard</h1>

        <p className="text-neutral-600">
          Development-only preview using simulated data.
        </p>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
        {developmentScholarships.map((scholarship) => (
          <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
        ))}
      </div>
    </main>
  );
}
