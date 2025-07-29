import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { z } from 'zod';

const proposalSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  fileUrl: z.string().url(),
});

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const isRead = searchParams.get('isRead');
  const search = searchParams.get('search');

  let query = supabaseServer.from('proposals').select('*', { count: 'exact' });
  if (isRead === 'true' || isRead === 'false') {
    query = query.eq('is_read', isRead === 'true');
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`
    );
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ data, total: count }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}


export async function POST(req: Request) {
  const body = await req.json();

  const result = proposalSchema.safeParse(body);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Data tidak valid', issues: result.error.format() }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const { name, email, phoneNumber, fileUrl } = result.data;

  const { data: existingProposal, error: checkError } = await supabaseServer
    .from('proposals')
    .select('id')
    .eq('email', email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return new Response(JSON.stringify({ error: checkError.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (existingProposal) {
    return new Response(JSON.stringify({ error: 'Proposal dengan email ini sudah ada' }), {
      status: 409,
      headers: corsHeaders,
    });
  }

  const { error } = await supabaseServer.from('proposals').insert([
    {
      name,
      email,
      phone_number: phoneNumber,
      file_url: fileUrl,
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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data, error } = await supabaseServer
      .from('proposals')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ message: 'Status updated', data }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: corsHeaders,
    });
  }
}

