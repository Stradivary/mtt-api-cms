import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';
import { pendaftaranQurbanSchema } from '@/app/schemas/pendaftaranQurbanSchema';

const TABLE_NAME = 'qurban_registration_1447h';

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
		console.log('[qurban/pendaftaran] POST request started');
		const contentType = req.headers.get('content-type') || '';
		console.log('[qurban/pendaftaran] content-type:', contentType);

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
				buktiBayar: body?.buktiBayarUrl || null,
			};
		}

		console.log('[qurban/pendaftaran] payload parsed:', payload);

		const result = pendaftaranQurbanSchema.safeParse(payload);

		if (!result.success) {
			console.error('[qurban/pendaftaran] validation failed:', result.error.format());
			return new Response(
				JSON.stringify({ error: 'Data tidak valid', issues: result.error.format() }),
				{
					status: 400,
					headers: corsHeaders,
				}
			);
		}

		console.log('[qurban/pendaftaran] validation success');

		const { nama, hp, hewan, qty, atasNama, tujuanQurban, lembaga, buktiBayar } = result.data;

		const buktiBayarUrl = typeof buktiBayar === 'string' ? buktiBayar : null;

		console.log('[qurban/pendaftaran] inserting to database:', {
			nama,
			hp,
			hewan,
			qty: Number(qty),
			atas_nama: atasNama,
			tujuan_qurban: tujuanQurban,
			lembaga,
			bukti_bayar_url: buktiBayarUrl,
		});

		let insertResult;
		try {
			insertResult = await supabaseServer.from(TABLE_NAME).insert([
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
			console.log('[qurban/pendaftaran] insert result:', {
				status: insertResult.status,
				statusText: insertResult.statusText,
				hasData: !!insertResult.data,
				hasError: !!insertResult.error,
				error: insertResult.error,
				data: insertResult.data,
				fullResponse: JSON.stringify(insertResult),
			});
		} catch (dbErr: any) {
			console.error('[qurban/pendaftaran] insert catch error:', {
				message: dbErr?.message,
				code: dbErr?.code,
				details: dbErr?.details,
				stack: dbErr?.stack,
			});
			throw dbErr;
		}

		const { data, error } = insertResult;

		if (error) {
			console.error('[qurban/pendaftaran] database insert error:', {
				message: error.message,
				code: error.code,
				details: error.details,
				hint: error.hint,
				fullError: JSON.stringify(error),
				errorString: error.toString(),
			});
			return new Response(JSON.stringify({ error: error.message || 'Database error' }), {
				status: 500,
				headers: corsHeaders,
			});
		}

		console.log('[qurban/pendaftaran] insert success');

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json',
			},
		});
	} catch (err: any) {
		console.error('[qurban/pendaftaran] unexpected error:', {
			message: err?.message,
			name: err?.name,
			stack: err?.stack,
		});
		return new Response(JSON.stringify({ error: 'Invalid request body' }), {
			status: 400,
			headers: corsHeaders,
		});
	}
}
