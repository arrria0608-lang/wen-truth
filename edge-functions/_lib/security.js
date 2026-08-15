const encoder = new TextEncoder();

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'same-origin',
      ...extraHeaders
    }
  });
}

export function getKV(env = {}) {
  const kv = env.REPORTS_KV || globalThis.REPORTS_KV;
  if (!kv) throw new Error('REPORTS_KV 尚未绑定');
  return kv;
}

export function envValue(env, name) {
  return String(env?.[name] ?? globalThis[name] ?? '');
}

export function clientIP(request) {
  return request.headers.get('EO-Connecting-IP') || request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

export async function sha256(value) {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(String(value)))));
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

function constantTimeEqual(a, b) {
  const left = encoder.encode(String(a));
  const right = encoder.encode(String(b));
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}

export async function verifyPassword(password, encodedHash) {
  const [iterationsText, saltText, expected] = String(encodedHash || '').split('.');
  const iterations = Number(iterationsText);
  if (!iterations || !saltText || !expected || iterations < 100000) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(String(password)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64Url(saltText), iterations }, key, 256);
  return constantTimeEqual(toBase64Url(new Uint8Array(bits)), expected);
}

export async function createSession(username, secret) {
  const payload = toBase64Url(encoder.encode(JSON.stringify({ username, expiresAt: Date.now() + 8 * 60 * 60 * 1000, nonce: crypto.randomUUID() })));
  return `${payload}.${await hmac(payload, secret)}`;
}

function cookieValue(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const entry = cookie.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : '';
}

export async function requireAdmin(request, env = {}) {
  const secret = envValue(env, 'ADMIN_SESSION_SECRET');
  const token = cookieValue(request, 'bazi_admin_session');
  if (!secret || !token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !constantTimeEqual(signature, await hmac(payload, secret))) return null;
  try {
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (!session.username || Number(session.expiresAt) <= Date.now()) return null;
    return session;
  } catch (_) { return null; }
}

export function sessionCookie(token, maxAge = 28800) {
  return `bazi_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export async function readJSON(request, maximumBytes = 1024 * 1024) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > maximumBytes) throw new Error('请求内容过大');
  const text = await request.text();
  if (text.length > maximumBytes) throw new Error('请求内容过大');
  return JSON.parse(text || '{}');
}

export async function kvJSON(kv, key, fallback) {
  const value = await kv.get(key);
  if (!value) return fallback;
  try { return typeof value === 'string' ? JSON.parse(value) : value; } catch (_) { return fallback; }
}

export function adminMutationAllowed(request) {
  return request.headers.get('X-Requested-With') === 'BaziZhenyanWeb';
}

