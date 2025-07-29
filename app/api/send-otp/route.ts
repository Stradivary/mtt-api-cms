import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { sendOtpEmail } from '@/lib/email';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, name } = body;

  if (!email || !name) {
    return new Response(JSON.stringify({ error: 'Email dan nama wajib diisi' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  const { error } = await supabaseServer.from('email_otps').insert({
    email,
    otp,
    expires_at: expiresAt,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    await sendOtpEmail(email, name, otp);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gagal mengirim email' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true, message: 'OTP dikirim ke email' }), {
    status: 200,
    headers: corsHeaders,
  });
}
