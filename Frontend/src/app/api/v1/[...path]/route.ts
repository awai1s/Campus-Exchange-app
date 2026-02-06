// File: src/app/api/v1/[...path]/route.ts
export const runtime = 'nodejs';

const BACKEND = 'https://campus-exchange-fastapi-production.up.railway.app';

type Ctx = { params: Promise<{ path: string[] }> }; // <- params are async in your setup

function join(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

function buildPath(parts: string[]) {
  // Swagger shows /api/v1/verification/request (no final slash)
  return `/api/v1/${(parts ?? []).join('/')}`;
}

async function forward(req: Request, parts: string[]) {
  const path = buildPath(parts);
  const targetUrl = new URL(join(BACKEND, path));

  // preserve query
  const here = new URL(req.url);
  if (here.search) targetUrl.search = here.search;

  // clone headers & drop hop-by-hop
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  headers.delete('transfer-encoding');

  const withBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'follow',
    cache: 'no-store',
  };

  if (withBody.includes(req.method)) {
    // buffer the incoming body → avoids Node fetch “duplex” error
    const ab = await req.arrayBuffer();
    (init as any).body = Buffer.from(ab);
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), init);
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : 'fetch to backend failed';
    return new Response(
      JSON.stringify({ detail: `Proxy error to ${targetUrl}: ${msg}` }),
      { status: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    const out = text || JSON.stringify({ detail: `${upstream.status} ${upstream.statusText}` });
    return new Response(out, {
      status: upstream.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete('transfer-encoding');
  outHeaders.delete('connection');
  outHeaders.delete('access-control-allow-origin');
  outHeaders.delete('access-control-allow-credentials');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

export async function GET(req: Request, ctx: Ctx)    { const { path } = await ctx.params; return forward(req, path); }
export async function POST(req: Request, ctx: Ctx)   { const { path } = await ctx.params; return forward(req, path); }
export async function PUT(req: Request, ctx: Ctx)    { const { path } = await ctx.params; return forward(req, path); }
export async function PATCH(req: Request, ctx: Ctx)  { const { path } = await ctx.params; return forward(req, path); }
export async function DELETE(req: Request, ctx: Ctx) { const { path } = await ctx.params; return forward(req, path); }

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}
