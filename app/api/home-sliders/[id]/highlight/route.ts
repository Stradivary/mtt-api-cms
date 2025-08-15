import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  const body = await req.json();
  const { visible } = body;

  if (typeof visible !== 'boolean') {
    return new Response(JSON.stringify({ error: 'visible harus boolean' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: visibleSliders, error: countError } = await supabaseServer
    .from('home_sliders')
    .select('id')
    .eq('visible', true);

  if (countError) {
    return new Response(JSON.stringify({ error: countError.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (!visible && visibleSliders.length === 1 && visibleSliders.some(s => s.id === id)) {
    return new Response(
      JSON.stringify({ error: 'Tidak bisa menyembunyikan, minimal 1 slider harus ditampilkan.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  if (visible && visibleSliders.length >= 5 && !visibleSliders.some(s => s.id === id)) {
    return new Response(
      JSON.stringify({ error: 'Maksimal 5 slider yang bisa ditampilkan.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { error } = await supabaseServer
    .from('home_sliders')
    .update({ visible })
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
}
