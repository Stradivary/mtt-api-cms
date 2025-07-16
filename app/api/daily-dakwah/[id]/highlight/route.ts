import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: any }
) {
  const id = params.id;

  const body = await req.json();
  const { highlight } = body;

  if (typeof highlight !== 'boolean') {
    return NextResponse.json({ error: 'Field highlight wajib boolean' }, { status: 400 });
  }

  const { data: dakwah, error: fetchError } = await supabaseServer
    .from('daily_dakwah')
    .select('published')
    .eq('id', id)
    .single();

  if (fetchError || !dakwah) {
    return NextResponse.json({ error: fetchError?.message ?? 'Data tidak ditemukan' }, { status: 404 });
  }

  if (!dakwah.published && highlight) {
    return NextResponse.json(
      { error: 'Hanya dakwah yang sudah dipublikasikan yang bisa di highlight' },
      { status: 400 }
    );
  }

  if (highlight) {
    const { count } = await supabaseServer
      .from('daily_dakwah')
      .select('*', { count: 'exact', head: true })
      .eq('highlight', true);

    if ((count || 0) >= 5) {
      return NextResponse.json(
        { error: 'Maksimal hanya 5 dakwah yang bisa di-highlight' },
        { status: 400 }
      );
    }
  }

  const { error } = await supabaseServer
    .from('daily_dakwah')
    .update({ highlight })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
