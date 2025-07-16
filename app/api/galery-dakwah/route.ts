import { supabaseServer } from '@/lib/supabase-server';
import { corsHeaders } from '@/lib/cors';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const offset = (page - 1) * limit;

  const { data, error } = await supabaseServer
    .from('galery_dakwah')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File;

  if (!file || !file.name) {
    return new Response(JSON.stringify({ error: 'File tidak valid' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const ext = file.name.split('.').pop();
  const filename = `dakwah-${uuidv4()}.${ext}`;
  const filepath = `dakwah/${filename}`;

  const { error: uploadError } = await supabaseServer.storage
    .from('mtt-images')
    .upload(filepath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const { data: publicUrl } = supabaseServer.storage
    .from('mtt-images')
    .getPublicUrl(filepath);

  const { error: insertError } = await supabaseServer
    .from('galery_dakwah')
    .insert({
      name: filename,
      url: publicUrl.publicUrl,
    });

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
}
