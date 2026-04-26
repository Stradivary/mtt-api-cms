import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { pendaftaranQurbanSchema } from '@/app/schemas/pendaftaranQurbanSchema';

const TABLE_NAME = 'pendaftaran_kurban_1447h';

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

	let query = supabaseServer.from(TABLE_NAME).select('*', { count: 'exact' });

	if (search) {
		query = query.or(
			`nama.ilike.%${search}%,hp.ilike.%${search}%,atas_nama.ilike.%${search}%,tujuan_qurban.ilike.%${search}%`
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
	try {
		const contentType = req.headers.get('content-type') || '';

		let payload: {
			nama: string;
			hp: string;
			hewan: string;
			qty: string;
			atasNama: string;
			tujuanQurban: string;
			lembaga: string;
			buktiBayar?: string | null;
		};

		if (contentType.includes('multipart/form-data')) {
			const formData = await req.formData();
			const buktiBayar = formData.get('buktiBayar');

			payload = {
				nama: String(formData.get('nama') || ''),
				hp: String(formData.get('hp') || ''),
				hewan: String(formData.get('hewan') || ''),
				qty: String(formData.get('qty') || ''),
				atasNama: String(formData.get('atasNama') || ''),
				tujuanQurban: String(formData.get('tujuanQurban') || ''),
				lembaga: String(formData.get('lembaga') || ''),
				buktiBayar: typeof buktiBayar === 'string' ? buktiBayar : null,
			};
		} else {
			const body = await req.json();
			payload = {
				nama: String(body?.nama || ''),
				hp: String(body?.hp || ''),
				hewan: String(body?.hewan || ''),
				qty: String(body?.qty || ''),
				atasNama: String(body?.atasNama || ''),
				tujuanQurban: String(body?.tujuanQurban || ''),
				lembaga: String(body?.lembaga || ''),
				buktiBayar: body?.buktiBayar || null,
			};
		}

		const result = pendaftaranQurbanSchema.safeParse(payload);

		if (!result.success) {
			return new Response(
				JSON.stringify({ error: 'Data tidak valid', issues: result.error.format() }),
				{
					status: 400,
					headers: corsHeaders,
				}
			);
		}

		const { nama, hp, hewan, qty, atasNama, tujuanQurban, lembaga, buktiBayar } = result.data;

		const buktiBayarUrl = typeof buktiBayar === 'string' ? buktiBayar : null;

		const { error } = await supabaseServer.from(TABLE_NAME).insert([
			{
				nama,
				hp,
				hewan,
				qty: Number(qty),
				atas_nama: atasNama,
				tujuan_qurban: tujuanQurban,
				lembaga,
				bukti_bayar_url: buktiBayarUrl,
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
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json',
			},
		});
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid request body' }), {
			status: 400,
			headers: corsHeaders,
		});
	}
}
