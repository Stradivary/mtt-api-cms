import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { corsHeaders } from '@/lib/cors';
import {
	ALLOWED_BUKTI_BAYAR_TYPES,
	MAX_FILE_SIZE,
} from '@/app/schemas/pendaftaranQurbanSchema';

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

		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: 'Ukuran bukti bayar maksimal 1MB' },
				{ status: 400 }
			);
		}

		if (!ALLOWED_BUKTI_BAYAR_TYPES.includes(file.type as (typeof ALLOWED_BUKTI_BAYAR_TYPES)[number])) {
			return NextResponse.json(
				   { error: 'Bukti bayar harus JPG, JPEG, PNG, WEBP, atau PDF' },
				{ status: 400 }
			);
		}

		const ext = file.name.split('.').pop();
		const fileName = `${Date.now()}.${ext}`;
		const filePath = `qurban/${fileName}`;

		const arrayBuffer = await file.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);

		const { data, error } = await supabaseServer.storage
			.from('mtt-qurban')
			.upload(filePath, buffer, {
				contentType: file.type,
				upsert: true,
			});

		if (error) {
			console.error('Upload error:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		const { data: publicData } = supabaseServer.storage
			.from('mtt-qurban')
			.getPublicUrl(data.path);

		const publicUrl = publicData.publicUrl;

		return NextResponse.json(
			{
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
			}
		);
	} catch (err: any) {
		console.error('Upload gagal:', err);
		return NextResponse.json(
			{ error: 'Upload gagal: ' + (err?.message || 'Unknown error') },
			{ status: 500 }
		);
	}
}
