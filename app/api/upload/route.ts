import { supabaseServer } from '@/lib/supabase-server';
import { getPublicImageUrl } from '@/lib/supabase-url';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `news/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const { data, error } = await supabaseServer.storage
      .from('mtt-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const publicUrl = getPublicImageUrl(data.path);

    const { error: dbError } = await supabaseServer.from('gallery_news').insert([
      {
        name: file.name,
        path: data.path,
        url: publicUrl,
        uploaded_by: 'admin',
      },
    ]);

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Gagal simpan metadata ke database' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Upload berhasil',
      path: data.path,
      url: publicUrl,
    });
  } catch (err: any) {
    console.error('Upload failed:', err);
    return NextResponse.json(
      { error: 'Upload gagal: ' + (err?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
