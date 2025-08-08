import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest) {
  const userId = '64b1b852-8867-470a-bf01-e378e1eb0af7';

  const { data, error } = await supabaseServer
    .from('users')
    .select('email, phone_number, location')
    .eq('id', userId)
    .single();

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
