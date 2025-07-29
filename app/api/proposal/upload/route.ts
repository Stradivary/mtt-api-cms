import { NextResponse } from 'next/server';
import { getPublicFileUrl } from '@/lib/supabase-file-url';
import { supabaseServer } from '@/lib/supabase-server';
import { corsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: corsHeaders,
	});
}

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
		}

		const ext = file.name.split('.').pop();
		const fileName = `${Date.now()}.${ext}`;
		const filePath = `proposal/${fileName}`;

		const arrayBuffer = await file.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);

		const { data, error } = await supabaseServer.storage
			.from('mtt-proposals')
			.upload(filePath, buffer, {
				contentType: file.type,
				upsert: true,
			});

		if (error) {
			console.error('Upload error:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		const publicUrl = getPublicFileUrl(data.path);

		return NextResponse.json({
			message: 'Upload berhasil',
			path: data.path,
			url: publicUrl,
		},
			{
				status: 200,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			});
	} catch (err: any) {
		console.error('Upload gagal:', err);
		return NextResponse.json(
			{ error: 'Upload gagal: ' + (err?.message || 'Unknown error') },
			{ status: 500 }
		);
	}
}
