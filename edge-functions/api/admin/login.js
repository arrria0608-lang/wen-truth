import { clientIP, createSession, envValue, getKV, json, kvJSON, readJSON, sessionCookie, sha256, verifyPassword } from '../../_lib/security.js';

export async function onRequestPost({ request, env }) {
  try {
    if (request.headers.get('X-Requested-With') !== 'BaziZhenyanWeb') return json({ message: '请求来源无效' }, 403);
    const usernameExpected = envValue(env, 'ADMIN_USERNAME');
    const passwordHash = envValue(env, 'ADMIN_PASSWORD_HASH');
    const sessionSecret = envValue(env, 'ADMIN_SESSION_SECRET');
    if (!usernameExpected || !passwordHash || sessionSecret.length < 32) return json({ message: '后台尚未完成安全配置' }, 503);
    const kv = getKV(env);
    const key = `rate_login_${(await sha256(clientIP(request))).slice(0, 32)}`;
    const rate = await kvJSON(kv, key, { count: 0, startedAt: Date.now() });
    if (Date.now() - rate.startedAt > 15 * 60 * 1000) { rate.count = 0; rate.startedAt = Date.now(); }
    if (rate.count >= 8) return json({ message: '登录尝试次数过多，请十五分钟后再试' }, 429);
    const body = await readJSON(request, 20000);
    const valid = String(body.username || '') === usernameExpected && await verifyPassword(String(body.password || ''), passwordHash);
    if (!valid) {
      rate.count += 1;
      await kv.put(key, JSON.stringify(rate));
      return json({ message: '账号或密码错误' }, 401);
    }
    await kv.put(key, JSON.stringify({ count: 0, startedAt: Date.now() }));
    const token = await createSession(usernameExpected, sessionSecret);
    return json({ authenticated: true }, 200, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) { return json({ message: error.message || '登录失败' }, 500); }
}

