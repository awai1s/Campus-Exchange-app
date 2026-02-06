// Always call same-origin /api/v1/* (handled by our server-side proxy).
const RELATIVE_BASE = '/api/v1';

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}
function sameOriginBase() {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return joinUrl(origin, RELATIVE_BASE);
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 120000) { // 120s default
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const id = setTimeout(() => controller?.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller?.signal, cache: 'no-store' });
  } finally {
    clearTimeout(id);
  }
}

// allow callers to override timeout via init.timeoutMs
type ApiInit = RequestInit & { timeoutMs?: number };

export async function apiFetch(path: string, init: ApiInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const tokenType =
    typeof window !== 'undefined' ? localStorage.getItem('token_type') || 'Bearer' : 'Bearer';

  const headers = new Headers(init.headers || {});
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;

  if (!isForm && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token && !headers.has('Authorization')) headers.set('Authorization', `${tokenType} ${token}`);

  const url = joinUrl(sameOriginBase(), path);

  // pull out timeoutMs (fallback to 120s if not provided)
  const { timeoutMs, ...rest } = init;
  const ms = typeof timeoutMs === 'number' ? timeoutMs : 120000;

  let res: Response;
  try {
    res = await fetchWithTimeout(url, { ...rest, headers }, ms);
  } catch (e: any) {
    throw new Error(`Network error while calling ${url}: ${e?.message || 'Failed to fetch'}`);
  }

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    // surface backend error text (string) or JSON .detail/.message when present
    let msg =
      (data && (typeof data === 'object' ? (data as any).detail || (data as any).message : undefined)) ||
      (typeof data === 'string' && data.trim().length ? data : `${res.status} ${res.statusText}`);
    if (typeof msg === 'object') { try { msg = JSON.stringify(msg); } catch {} }
    throw new Error(msg as string);
  }
  return data;
}

export function toImageUrl(url?: string) {
  if (!url) return '';
  let u = String(url).trim();

  // fix common mistakes
  u = u.replace(/\\/g, '/');          // backslashes → forward slashes
  u = u.replace(/\s/g, '%20');        // spaces → %20

  // if it's already absolute http(s), pass through
  if (/^https?:\/\//i.test(u)) return u;

  // allow "uploads/..." or "./uploads/..." etc.
  if (/^\.?\/?uploads\//i.test(u)) {
    u = u.replace(/^\.?\/?/, '/');    
    return u;                         // served via our /uploads rewrite
  }

  // otherwise treat as same-origin path
  return u.startsWith('/') ? u : `/${u}`;
}
