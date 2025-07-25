import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { corsHeaders } from '@/lib/cors';

function extractIdFromUrl(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split('/');
  return parts[parts.length - 1] || null;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest) {
  const id = extractIdFromUrl(req);

  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('daily_dakwah')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Data tidak ditemukan' },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(data, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function DELETE(req: NextRequest) {
  const id = extractIdFromUrl(req);

  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('daily_dakwah')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
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

  const { title, description, image_url, published } = body;

  if (!title || typeof published === 'undefined') {
    return NextResponse.json({ error: 'Field title dan published wajib diisi' }, { status: 400 });
  }

  const updatePayload = {
    title,
    description,
    image_url,
    published,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseServer
    .from('daily_dakwah')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
