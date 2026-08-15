import { json, requireAdmin } from '../../_lib/security.js';

export async function onRequestGet({ request, env }) {
  const session = await requireAdmin(request, env);
  return session ? json({ authenticated: true, username: session.username }) : json({ authenticated: false }, 401);
}

