import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

function extractIdFromUrl(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split('/');
  return parts[parts.length - 1] || null;
}

export async function GET(req: NextRequest) {
  const id = extractIdFromUrl(req);
  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Berita tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const id = extractIdFromUrl(req);
  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('news')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const id = extractIdFromUrl(req);
  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Data tidak valid (bukan JSON)' }, { status: 400 });
  }

  const { title, content, imagePath } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Judul dan isi berita wajib diisi' }, { status: 400 });
  }

  const updatePayload: Record<string, any> = {
    title,
    content,
  };

  if (imagePath) {
    updatePayload.image_path = imagePath;
  }

  const { error } = await supabaseServer
    .from('news')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
