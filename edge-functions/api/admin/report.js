import { adminMutationAllowed, getKV, json, kvJSON, requireAdmin } from '../../_lib/security.js';

function safeId(request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  return /^report_[a-z0-9]+$/i.test(id) ? id : '';
}

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ message: '登录已失效，请重新登录' }, 401);
  const id = safeId(request);
  if (!id) return json({ message: '报告编号无效' }, 400);
  const stored = await kvJSON(getKV(env), `report_${id}`, null);
  return stored ? json(stored) : json({ message: '报告不存在或已删除' }, 404);
}

export async function onRequestDelete({ request, env }) {
  if (!adminMutationAllowed(request)) return json({ message: '请求来源无效' }, 403);
  if (!await requireAdmin(request, env)) return json({ message: '登录已失效，请重新登录' }, 401);
  const id = safeId(request);
  if (!id) return json({ message: '报告编号无效' }, 400);
  const kv = getKV(env);
  await kv.delete(`report_${id}`);
  const index = await kvJSON(kv, 'report_index', []);
  await kv.put('report_index', JSON.stringify(index.filter(item => item.id !== id)));
  return json({ deleted: true });
}

