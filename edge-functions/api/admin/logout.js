import { adminMutationAllowed, json, sessionCookie } from '../../_lib/security.js';

export function onRequestPost({ request }) {
  if (!adminMutationAllowed(request)) return json({ message: '请求来源无效' }, 403);
  return json({ authenticated: false }, 200, { 'Set-Cookie': sessionCookie('', 0) });
}

