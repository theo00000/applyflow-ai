import test from "node:test";
import assert from "node:assert/strict";
import { assessGroundedness } from "../scripts/lib/groundedness-utils.mjs";

const documents = [{ chunkId: "2", content: "IPK minimum: 3.40. Deadline: 5 Desember 2026." }];
const answer = "IPK minimum Beasiswa Teknologi adalah 3,40.";
const claim = (overrides = {}) => ({
  answerSpan: answer,
  claim: "IPK minimum adalah 3,40",
  supported: true,
  evidence: "IPK minimum: 3.40.",
  reason: "Supported",
  ...overrides,
});
const judge = (claims, allClaimsSupported = true) => ({ claims, allClaimsSupported });
const verify = (evaluation, text = answer) => assessGroundedness({answer: text, documents, evaluation});

test("accepts valid supported answer", () => {
  assert.equal(verify(judge([claim()])).passed, true);
});
test("accepts surrounding quote chars in raw evidence", () => {
  assert.equal(verify(judge([claim({evidence: '"IPK minimum: 3.40."'})])).evidenceValid, true);
});
test("rejects fabricated unsupported claim", () => {
  const result = verify(judge([claim({claim: "uang saku Rp2 juta", supported:false, evidence: ""})], false));
  assert.equal(result.passed, false);
});
test("rejects contamination from user prompt (not in answer)", () => {
  const result = verify(judge([claim({answerSpan:"IPK minimum adalah 0.00"})]));
  assert.equal(result.spansValid, false);
  assert.equal(result.passed, false);
});
test("rejects explanation appended to evidence", () => {
  const result = verify(judge([claim({evidence:'"IPK minimum: 3.40." (dari sumber)'})]));
  assert.equal(result.evidenceValid, false);
});
test("rejects contradictory overall verdict", () => {
  assert.equal(verify(judge([claim()], false)).evaluationConsistent, false);
});
test("rejects no factual claims", () => {
  assert.equal(verify(judge([])).passed, false);
});
test("rejects mixed supported and unsupported factual claims", () => {
  const longAnswer = answer + " Uang saku Rp2.000.000 per bulan.";
  const result = verify(judge([
    claim(),
    claim({answerSpan:"Uang saku Rp2.000.000 per bulan.", claim:"Uang saku Rp2 juta", supported:false, evidence:""}),
  ], false),longAnswer);
  assert.equal(result.spansValid, true);
  assert.equal(result.passed, false);
});
