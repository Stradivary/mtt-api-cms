import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/jwt';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const { token } = parse(cookieHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from('users')
      .select('id, email, name, phone_number, location')
      .eq('id', decoded.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Token verification error:', err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const { token } = parse(cookieHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const body = await req.json();
    const { email, name, phone_number, location } = body;

    const { data, error } = await supabaseServer
      .from('users')
      .update({
        email,
        name,
        phone_number,
        location
      })
      .eq('id', decoded.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', data });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
