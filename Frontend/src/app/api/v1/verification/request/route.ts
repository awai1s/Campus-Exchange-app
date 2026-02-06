export const runtime = 'edge'; // use Edge runtime to avoid Node/undici TLS quirks

const BACKEND = 'https://campus-exchange-fastapi-production.up.railway.app';
const TARGET = `${BACKEND}/api/v1/verification/request`;

function cleanHeaders(h: Headers) {
  const out = new Headers(h);
  out.delete('host');
  out.delete('connection');
  out.delete('content-length');
  out.delete('transfer-encoding');
  return out;
}

export async function POST(req: Request) {
  const inHeaders = cleanHeaders(req.headers);
  const ct = inHeaders.get('content-type') || '';

  // Build body according to content type (don’t set content-type for FormData!)
  let body: BodyInit | null = null;

  try {
    if (ct.includes('application/json')) {
      const json = await req.json();
      body = JSON.stringify(json);
      inHeaders.set('content-type', 'application/json');
    } else if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      body = form;
      inHeaders.delete('content-type'); // let boundary be set automatically
    } else {
      const ab = await req.arrayBuffer();
      body = ab;
    }
  } catch {
    // if parsing fails just stream raw
    const ab = await req.arrayBuffer();
    body = ab;
  }

  try {
    const res = await fetch(TARGET, {
      method: 'POST',
      headers: inHeaders,
      body,
      redirect: 'follow',
      // Edge runtime has its own timeouts; client still has your api.ts timeout
    });

    const outHeaders = new Headers(res.headers);
    outHeaders.delete('transfer-encoding');
    outHeaders.delete('connection');
    outHeaders.delete('access-control-allow-origin');
    outHeaders.delete('access-control-allow-credentials');

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: outHeaders,
    });
  } catch (e: any) {
    const detail = e?.message || 'fetch failed';
    return new Response(
      JSON.stringify({ detail: `Proxy error to ${TARGET}: ${detail}` }),
      { status: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } },
    );
  }
}
