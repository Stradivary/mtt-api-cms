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
    .from('news')
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
  const { title, content, imagePath } = body;

  if (!title || !content || !imagePath) {
    return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { error } = await supabaseServer
    .from('news')
    .insert([{ title, content, image_path: imagePath }]);

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
