import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function DELETE(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path) {
      return NextResponse.json({ error: 'Path tidak ditemukan' }, { status: 400 });
    }

    const { error: storageError } = await supabaseServer
      .storage
      .from('mtt-images')
      .remove([path]);

    if (storageError) {
      console.error('[Storage Error]', storageError);
      return NextResponse.json({ error: 'Gagal hapus dari storage: ' + storageError.message }, { status: 500 });
    }

    const { error: dbError } = await supabaseServer
      .from('gallery_news')
      .delete()
      .eq('path', path);

    if (dbError) {
      console.error('[Database Error]', dbError);
      return NextResponse.json({ error: 'Gagal hapus dari database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan: ' + err.message }, { status: 500 });
  }
}

