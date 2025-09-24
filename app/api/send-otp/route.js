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
  console.log('=== 환경변수 체크 ===');
  console.log('ALIGO_USER_ID:', process.env.ALIGO_USER_ID ? 'OK' : 'MISSING');
  console.log('ALIGO_API_KEY:', process.env.ALIGO_API_KEY ? 'OK' : 'MISSING');
  console.log('ALIGO_SENDER:', process.env.ALIGO_SENDER ? 'OK' : 'MISSING');
  
  try {
    const { phone } = await req.json();
    if (!/^01[0-9]{8,9}$/.test(phone)) return resp(400, { message: 'Invalid phone' });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
    const rlKey = `rl:${phone}:${ip}`;
    if (await kv.get(rlKey)) return resp(429, { message: '잠시 후 다시 시도해주세요.' });
    await kv.set(rlKey, 1, { ex: 60 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await sha256(`${phone}:${code}`);
    await kv.set(`otp:${phone}`, hash, { ex: 300 });

    const ok = await sendSmsWithAligo(phone, `[팅팅팅] 인증번호 ${code} (5분 내 입력)`);
    if (!ok) return resp(500, { message: '발송 실패' });

    return resp(200, { ok: true });
  } catch (e) {
    return resp(500, { message: '발송 실패' });
  }
}

async function sha256(s) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function sendSmsWithAligo(to, msg) {
  console.log('=== 알리고 API 호출 시작 ===');
  
  const user_id = process.env.ALIGO_USER_ID;
  const key     = process.env.ALIGO_API_KEY;
  const sender  = process.env.ALIGO_SENDER;

  console.log('발신번호:', sender);
  console.log('수신번호:', to);

  const form = new URLSearchParams();
  form.set('user_id', user_id);
  form.set('key', key);
  form.set('sender', sender);
  form.set('receiver', to);
  form.set('msg', msg);
  form.set('testmode_yn', 'Y');

  const r = await fetch('https://apis.aligo.in/send/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: form.toString(),
  });

  console.log('알리고 응답 상태:', r.status);
  
  if (!r.ok) {
    console.log('알리고 HTTP 에러');
    return false;
  }
  
  const data = await r.json().catch(() => ({}));
  console.log('알리고 응답 데이터:', JSON.stringify(data));
  
  return data && (data.result_code === '1' || data.result_code === 1);
}
