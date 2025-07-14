import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const offset = (page - 1) * limit;

  try {
    const { data, error, count } = await supabaseServer
      .from('gallery_news')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      page,
      total: count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal memuat gambar: ' + err.message },
      { status: 500 }
    );
  }
}
