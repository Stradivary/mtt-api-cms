import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { corsHeaders } from '@/lib/cors';

function extractIdFromUrl(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split('/');
  return parts[parts.length - 2] || null;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function PATCH(req: NextRequest) {
  const id = extractIdFromUrl(req);
  if (!id) {
    return NextResponse.json({ error: 'ID tidak ditemukan di URL' }, { status: 400, headers: corsHeaders });
  }

  const { error } = await supabaseServer
    .from('proposals')
    .update({ read_at: new Date().toISOString(), is_read:true })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
}
