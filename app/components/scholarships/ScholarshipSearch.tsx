"use client";

import { useState } from "react";

import ScholarshipCard from "../../components/scholarships/ScholarshipCard";
import type { ScholarshipSummary } from "../../../lib/scholarships/types";

type ScholarshipSearchProps = {
  scholarships: ScholarshipSummary[];
};

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("id-ID");
}

export default function ScholarshipSearch({
  scholarships,
}: ScholarshipSearchProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = normalizeSearch(query);

  const filteredScholarships = scholarships.filter((scholarship) => {
    if (!normalizedQuery) return true;

    const searchableText = normalizeSearch(
      `${scholarship.title} ${scholarship.organizer}`,
    );

    return searchableText.includes(normalizedQuery);
  });

  const resultCount = filteredScholarships.length;
  const hasQuery = normalizedQuery.length > 0;

  function clearSearch() {
    setQuery("");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label
          htmlFor="scholarship-search"
          className="block text-sm font-semibold text-app-text"
        >
          Search scholarships
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="scholarship-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or organizer..."
            autoComplete="off"
            className="min-h-11 w-full min-w-0 rounded-xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text outline-none placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-app-text focus-visible:ring-offset-2"
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="min-h-11 shrink-0 rounded-xl border border-app-border bg-app-surface px-5 py-3 text-sm font-semibold text-app-text transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-text"
            >
              Clear search
            </button>
          )}
        </div>

        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-neutral-600"
        >
          {resultCount} {resultCount === 1 ? "scholarship" : "scholarships"}{" "}
          found
        </p>
      </div>

      {resultCount > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredScholarships.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-app-border bg-app-surface px-5 py-12 text-center">
          <h3 className="text-lg font-semibold text-app-text">
            No scholarships found
          </h3>

          <p className="mt-2 text-sm text-neutral-600">
            {hasQuery
              ? "Try a different scholarship title or organizer."
              : "No scholarships are currently available."}
          </p>

          {hasQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 min-h-11 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-app-text transition-colors hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-text"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
