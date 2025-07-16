import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

function extractIdFromUrl(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split('/');
  return parts[parts.length - 1] || null;
}

export async function DELETE(req: NextRequest) {
  const id = extractIdFromUrl(req);

  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  const { data, error: getError } = await supabaseServer
    .from('galery_dakwah')
    .select('*')
    .eq('id', id)
    .single();

  if (getError || !data) {
    return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
  }

  const filePath = `dakwah/${data.name}`;

  const { error: deleteStorageError } = await supabaseServer.storage
    .from('mtt-images')
    .remove([filePath]);

  if (deleteStorageError) {
    return NextResponse.json({ error: 'Gagal hapus dari storage' }, { status: 500 });
  }

  const { error: deleteDbError } = await supabaseServer
    .from('galery_dakwah')
    .delete()
    .eq('id', id);

  if (deleteDbError) {
    return NextResponse.json({ error: 'Gagal hapus dari database' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
