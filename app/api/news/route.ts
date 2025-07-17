import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const category = searchParams.get('category');

  let query = supabaseServer
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (category) {
    if (isUUID(category)) {
      query = query.eq('category_id', category);
    } else {
      query = query.eq('category_name', category);
    }
  }

  const { data, error } = await query;

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
  const { title, content, imagePath, category_id, category_name } = body;

  if (!title || !content || !imagePath || !category_id || !category_name) {
    return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { error } = await supabaseServer.from('news').insert([
    {
      title,
      content,
      image_path: imagePath,
      category_id,
      category_name,
    },
  ]);

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
