export async function GET() {
  return Response.json({ status: "ok", service: "applyflow-ai" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
