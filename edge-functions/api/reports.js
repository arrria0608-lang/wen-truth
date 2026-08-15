import { clientIP, getKV, json, kvJSON, readJSON, sha256 } from '../_lib/security.js';

function validReport(report) {
  return report && /^report_[a-z0-9]+$/i.test(String(report.id || '')) && /^R[0-9]+$/i.test(String(report.reportNo || '')) && report.chart && Array.isArray(report.chart.pillars) && report.chart.pillars.length === 4;
}

export async function onRequestPost({ request, env }) {
  try {
    if (request.headers.get('X-Requested-With') !== 'BaziZhenyanWeb') return json({ message: '请求来源无效' }, 403);
    const kv = getKV(env);
    const ipKey = `rate_report_${(await sha256(clientIP(request))).slice(0, 32)}`;
    const rate = await kvJSON(kv, ipKey, { count: 0, startedAt: Date.now() });
    if (Date.now() - rate.startedAt > 60 * 60 * 1000) { rate.count = 0; rate.startedAt = Date.now(); }
    rate.count += 1;
    await kv.put(ipKey, JSON.stringify(rate));
    if (rate.count > 20) return json({ message: '提交过于频繁，请稍后再试' }, 429);

    const body = await readJSON(request, 900000);
    if (!validReport(body.report)) return json({ message: '报告格式无效' }, 400);
    const stored = { report: body.report, lead: body.lead || null, order: body.order || null, storedAt: new Date().toISOString() };
    await kv.put(`report_${body.report.id.replace(/[^a-z0-9_]/gi, '')}`, JSON.stringify(stored));

    const index = await kvJSON(kv, 'report_index', []);
    const summary = {
      id: body.report.id,
      reportNo: body.report.reportNo,
      createdAt: body.report.createdAt,
      expiresAt: body.report.expiresAt,
      city: body.report.chart?.city?.name || body.lead?.birth?.cityName || '',
      sex: body.lead?.birth?.sex === 'female' ? '女命' : body.lead?.birth?.sex === 'male' ? '男命' : '',
      storedAt: stored.storedAt
    };
    const next = [summary, ...index.filter(item => item.id !== summary.id)].slice(0, 1000);
    await kv.put('report_index', JSON.stringify(next));
    return json({ stored: true, reportId: summary.id }, 201);
  } catch (error) { return json({ message: error.message || '报告保存失败' }, 500); }
}

