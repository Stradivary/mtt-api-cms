import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { z } from 'zod';

const zakatSchema = z.object({
	name: z.string().min(2, 'Nama minimal 2 karakter'),
	nik: z.string().regex(/^\d+$/, 'NIK harus angka').min(16).max(20),
	unit_kerja: z.string().min(2, 'Unit kerja wajib diisi'),
	email: z.string().email('Email tidak valid'),
	telepon: z
		.string()
		.regex(/^\d+$/, 'Nomor telepon harus angka')
		.min(8, 'Nomor telepon minimal 8 digit')
		.max(14, 'Nomor telepon maksimal 14 digit'),
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
	const search = searchParams.get('search');

	let query = supabaseServer.from('zakat_registration').select('*', { count: 'exact' });

	if (search) {
		query = query.or(
			`name.ilike.%${search}%,nik.ilike.%${search}%,email.ilike.%${search}%,telepon.ilike.%${search}%`
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

	const result = zakatSchema.safeParse(body);

	if (!result.success) {
		return new Response(
			JSON.stringify({ error: 'Data tidak valid', issues: result.error.format() }),
			{
				status: 400,
				headers: corsHeaders,
			}
		);
	}

	const { name, nik, unit_kerja, email, telepon } = result.data;

	const { data: existing } = await supabaseServer
		.from('zakat_registration')
		.select('id')
		.or(`nik.eq.${nik},email.eq.${email}`)
		.maybeSingle();

	if (existing) {
		return new Response(JSON.stringify({ error: 'NIK atau Email sudah terdaftar' }), {
			status: 409,
			headers: corsHeaders,
		});
	}

	const { error } = await supabaseServer.from('zakat_registration').insert([
		{
			name,
			nik,
			unit_kerja,
			email,
			telepon,
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

