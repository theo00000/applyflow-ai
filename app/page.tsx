import ScholarshipCard from "./components/scholarships/ScholarshipCard";
import { developmentScholarships } from "../lib/scholarships/dev-fixtures";

export default function DiscoverPage() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const scholarships = isDevelopment ? developmentScholarships : [];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full min-w-0 max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="space-y-3">
        <p className="text-sm font-semibold text-neutral-600">
          SCHOLARSHIP DISCOVERY
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
          Discover Scholarships
        </h1>

        <p className="max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
          Explore scholarship opportunities and review their eligibility
          requirements, deadlines, and source information.
        </p>
      </header>

      {isDevelopment && (
        <aside
          aria-label="Development data notice"
          className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5"
        >
          <p className="font-semibold text-app-text">Development Preview</p>

          <p className="mt-1 text-sm leading-6 text-neutral-600">
            The scholarships below are simulated records used for interface
            development. They are not official scholarship announcements.
          </p>
        </aside>
      )}

      <section aria-labelledby="scholarships-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2
              id="scholarships-heading"
              className="text-xl font-bold text-app-text sm:text-2xl"
            >
              Available Scholarships
            </h2>

            <p className="text-sm text-neutral-600">
              {isDevelopment
                ? `${scholarships.length} simulated scholarships`
                : "Scholarship listings are not available yet."}
            </p>
          </div>
        </div>

        {scholarships.length > 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {scholarships.map((scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center">
            <h3 className="text-lg font-semibold text-app-text">
              Scholarship listings coming soon
            </h3>

            <p className="mt-2 text-sm text-neutral-600">
              Live scholarship data integration has not been implemented yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
