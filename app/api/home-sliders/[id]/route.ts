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
    .from('home_sliders')
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
    .from('home_sliders')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  const body = await req.json();

  const {
    image,
    title,
    subtitle,
    description,
    button_text,
    button_link,
    bg_gradient,
    featured,
    visible
  } = body;

  if (!image || !title) {
    return new Response(JSON.stringify({ error: 'Image dan title wajib diisi' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  let newVisible = visible;

  if (visible === true) {
    const { count, error: countError } = await supabaseServer
      .from('home_sliders')
      .select('id', { count: 'exact', head: true })
      .eq('visible', true)
      .neq('id', id);

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if ((count ?? 0) >= 5) {
      newVisible = false;
    }
  }

  const { error } = await supabaseServer
    .from('home_sliders')
    .update({
      image,
      title,
      subtitle,
      description,
      button_text,
      button_link,
      bg_gradient,
      featured: featured ?? false,
      visible: typeof newVisible === 'boolean' ? newVisible : false,
    })
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true, visible: newVisible }), {
    status: 200,
    headers: corsHeaders,
  });
}