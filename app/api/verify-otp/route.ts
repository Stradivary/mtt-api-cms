import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, otp } = body;

  if (!email || !otp) {
    return new Response(JSON.stringify({ error: 'Email dan OTP diperlukan' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data, error } = await supabaseServer
    .from('email_otps')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'OTP tidak valid atau salah' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const now = new Date();
  if (new Date(data.expires_at) < now) {
    return new Response(JSON.stringify({ error: 'OTP sudah kedaluwarsa' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  await supabaseServer.from('email_otps').update({ verified: true }).eq('id', data.id);

  return new Response(JSON.stringify({ success: true, message: 'OTP valid' }), {
    status: 200,
    headers: corsHeaders,
  });
}
