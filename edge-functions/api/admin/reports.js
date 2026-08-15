import { getKV, json, kvJSON, requireAdmin } from '../../_lib/security.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ message: '登录已失效，请重新登录' }, 401);
  try {
    const index = await kvJSON(getKV(env), 'report_index', []);
    const now = Date.now();
    const reports = index.filter(item => !item.expiresAt || new Date(item.expiresAt).getTime() > now).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return json({ reports });
  } catch (error) { return json({ message: error.message || '读取报告失败' }, 500); }
}

