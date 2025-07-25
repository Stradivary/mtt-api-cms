import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const { data: user, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email.trim())
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  }

  const token = await generateToken({ id: user.id, email: user.email });

  const res = new NextResponse(JSON.stringify({ message: 'Login sukses' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': serialize('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }),
    },
  });

  return res;
}
