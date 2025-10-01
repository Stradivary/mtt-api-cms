import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function extractIdFromUrl(req: NextRequest): string | null {
	const parts = req.nextUrl.pathname.split('/');
	return parts[parts.length - 1] || null;
}

export async function DELETE(req: NextRequest) {
  const id = extractIdFromUrl(req);

  if (!id) {
    return NextResponse.json(
      { error: 'ID tidak ditemukan di URL' },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from('zakat_registration')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
