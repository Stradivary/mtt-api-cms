import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  const { data, error } = await supabaseServer
    .from('home_sliders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(req: Request) {
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

  const { count, error: countError } = await supabaseServer
    .from('home_sliders')
    .select('id', { count: 'exact', head: true })
    .eq('visible', true);

  if (countError) {
    return new Response(JSON.stringify({ error: countError.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  let newVisible: boolean;
  if (count === 0) {
    newVisible = true;
  } else if ((count ?? 0) >= 5) {
    newVisible = false;
  } else {
    newVisible = typeof visible === 'boolean' ? visible : true;
  }

  const { error } = await supabaseServer.from('home_sliders').insert([
    {
      image,
      title,
      subtitle,
      description,
      button_text,
      button_link,
      bg_gradient,
      featured: featured ?? false,
      visible: newVisible,
    },
  ]);

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
