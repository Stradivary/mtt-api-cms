import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, content, imagePath } = body;

  if (!title || !content || !imagePath) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('news')
    .insert([{ title, content, image_path: imagePath }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
