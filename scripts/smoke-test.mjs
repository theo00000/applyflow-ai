const base = process.env.RAG_BASE_URL || "http://localhost:3000";
const response = await fetch(`${base}/api/health`, {signal: AbortSignal.timeout(10000)});
if (!response.ok) throw new Error(`Health failed: ${response.status}`);
const data = await response.json();
if (data.status !== "ok") throw new Error("Unexpected health payload");
console.log("Health: PASS");
const rec = await fetch(`${base}/api/recommendations?major=Informatika&gpa=3.60`, {
  signal: AbortSignal.timeout(10000),
});
if (!rec.ok) throw new Error(`Recommendations failed: ${rec.status}`);
const result = await rec.json();
if (!Array.isArray(result.recommendations)) throw new Error("Invalid recommendations");
console.log(`Recommendations: PASS (${result.recommendations.length} sample results)`);
