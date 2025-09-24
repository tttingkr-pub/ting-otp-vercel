import { kv } from '@vercel/kv';

export const runtime = 'edge';

function resp(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json;charset=utf-8',
      'access-control-allow-origin': process.env.ALLOWED_ORIGIN || '*',
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}

export async function OPTIONS() { return resp(204, null); }

export async function POST(req) {
  try {
    const { phone, code } = await req.json();
    if (!/^01[0-9]{8,9}$/.test(phone) || !/^\d{6}$/.test(code))
      return resp(400, { message: '잘못된 입력' });

    const saved = await kv.get(`otp:${phone}`);
    if (!saved) return resp(400, { message: '인증번호가 만료되었거나 없습니다.' });

    const calc = await sha256(`${phone}:${code}`);
    if (calc !== saved) return resp(400, { message: '인증번호가 일치하지 않습니다.' });

    await kv.del(`otp:${phone}`);
    return resp(200, { ok: true });
  } catch (e) {
    return resp(500, { message: '검증 실패' });
  }
}

async function sha256(s) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}
