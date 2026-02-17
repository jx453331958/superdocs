const MCP_INTERNAL_URL = process.env.MCP_INTERNAL_URL || 'http://localhost:3002';

export async function GET() {
  const res = await fetch(`${MCP_INTERNAL_URL}/skill`);
  if (!res.ok) {
    return new Response('MCP server unavailable', { status: 502 });
  }
  const body = await res.text();
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
