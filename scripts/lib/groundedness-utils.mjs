/**
 * Validate a structured groundedness judge response.
 * This is a necessary provenance check, not proof of claim completeness.
 */
export function normalizeEvidence(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function assessGroundedness({ answer, documents, evaluation }) {
  const claims = Array.isArray(evaluation?.claims) ? evaluation.claims : [];
  const spansValid = claims.every(
    (claim) => typeof claim.answerSpan === "string" &&
      claim.answerSpan.length > 0 &&
      String(answer).includes(claim.answerSpan)
  );
  const evidenceValid = claims.every((claim) => {
    if (!claim.supported) return claim.evidence === "";
    const quote = normalizeEvidence(claim.evidence);
    return quote.length > 0 && documents.some(
      (document) => normalizeEvidence(document.content).includes(quote)
    );
  });
  const supported = claims.every((claim) => claim.supported === true);
  const evaluationConsistent =
    evaluation?.allClaimsSupported === supported;
  return {
    spansValid,
    evidenceValid,
    evaluationConsistent,
    passed: claims.length > 0 && spansValid && evidenceValid &&
      evaluationConsistent && supported &&
      evaluation?.allClaimsSupported === true,
  };
}
