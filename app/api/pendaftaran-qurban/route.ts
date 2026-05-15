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
			`nama.ilike.%${search}%,email.ilike.%${search}%,hp.ilike.%${search}%,tujuan_qurban.ilike.%${search}%,lembaga.ilike.%${search}%`
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

	let total = count;

	if (typeof total !== 'number') {
		let countQuery = supabaseServer.from(TABLE_NAME).select('id', { count: 'exact', head: true });

		if (search) {
			countQuery = countQuery.or(
				`nama.ilike.%${search}%,email.ilike.%${search}%,hp.ilike.%${search}%,tujuan_qurban.ilike.%${search}%,lembaga.ilike.%${search}%`
			);
		}

		const { count: fallbackCount } = await countQuery;
		total = typeof fallbackCount === 'number' ? fallbackCount : 0;
	}

	return new Response(JSON.stringify({ data, total }), {
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
			email: string;
			hp: string;
			qurbanItems: Array<{
				hewan: string;
				qty: string;
				atasNama: string;
				atasNamaList: string[];
			}>;
			tujuanQurban: string;
			lembaga: string;
			buktiBayarUrl?: string | null;
		};

		if (contentType.includes('multipart/form-data')) {
			const formData = await req.formData();
			const buktiBayarUrl = formData.get('buktiBayarUrl');
			const qurbanItemsStr = formData.get('qurbanItems');

			let qurbanItems = [];
			if (qurbanItemsStr) {
				try {
					qurbanItems = JSON.parse(String(qurbanItemsStr));
				} catch (e) {
					qurbanItems = [];
				}
			}

			payload = {
				nama: String(formData.get('nama') || ''),
				email: String(formData.get('email') || ''),
				hp: String(formData.get('hp') || ''),
				qurbanItems,
				tujuanQurban: String(formData.get('tujuanQurban') || ''),
				lembaga: String(formData.get('lembaga') || ''),
				buktiBayarUrl: typeof buktiBayarUrl === 'string' ? buktiBayarUrl : null,
			};
		} else {
			const body = await req.json();
			payload = {
				nama: String(body?.nama || ''),
				email: String(body?.email || ''),
				hp: String(body?.hp || ''),
				qurbanItems: Array.isArray(body?.qurbanItems) ? body.qurbanItems : [],
				tujuanQurban: String(body?.tujuanQurban || ''),
				lembaga: String(body?.lembaga || ''),
				buktiBayarUrl: body?.buktiBayarUrl || null,
			};
		}

		const result = pendaftaranQurbanSchema.safeParse(payload);

		if (!result.success) {
			return new Response(
				JSON.stringify({ error: 'Data tidak valid', issues: result.error.format() }),
				{ status: 400, headers: corsHeaders }
			);
		}

		const { nama, email, hp, qurbanItems, tujuanQurban, lembaga, buktiBayarUrl } = result.data;

		const buktiBayarUrlStr = typeof buktiBayarUrl === 'string' ? buktiBayarUrl : null;

		const insertData = {
			nama,
			email,
			hp,
			qurban_items: qurbanItems,
			tujuan_qurban: tujuanQurban,
			lembaga,
			bukti_bayar_url: buktiBayarUrlStr,
		};

		const { error } = await supabaseServer.from(TABLE_NAME).insert([insertData]);

		if (error) {
			return new Response(JSON.stringify({ error: error.message || 'Database error' }), {
				status: 500,
				headers: corsHeaders,
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: 'Invalid request body' }), {
			status: 400,
			headers: corsHeaders,
		});
	}
}

export async function PATCH(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');

		if (!id) {
			return new Response(
				JSON.stringify({ error: 'ID tidak ditemukan dalam query parameter' }),
				{ status: 400, headers: corsHeaders }
			);
		}

		const body = await req.json();

		// Build update object with only provided fields
		const updateData: any = {};

		if (body.nama !== undefined) updateData.nama = String(body.nama);
		if (body.email !== undefined) updateData.email = String(body.email);
		if (body.hp !== undefined) updateData.hp = String(body.hp);
		if (body.qurbanItems !== undefined) updateData.qurban_items = Array.isArray(body.qurbanItems) ? body.qurbanItems : [];
		if (body.tujuanQurban !== undefined) updateData.tujuan_qurban = String(body.tujuanQurban);
		if (body.lembaga !== undefined) updateData.lembaga = String(body.lembaga);
		if (body.buktiBayarUrl !== undefined) updateData.bukti_bayar_url = body.buktiBayarUrl ? String(body.buktiBayarUrl) : null;

		if (Object.keys(updateData).length === 0) {
			return new Response(
				JSON.stringify({ error: 'Tidak ada field yang akan diupdate' }),
				{ status: 400, headers: corsHeaders }
			);
		}

		const { error } = await supabaseServer
			.from(TABLE_NAME)
			.update(updateData)
			.eq('id', id);

		if (error) {
			return new Response(
				JSON.stringify({ error: error.message || 'Database error' }),
				{ status: 500, headers: corsHeaders }
			);
		}

		return new Response(
			JSON.stringify({ success: true, message: 'Data berhasil diupdate' }),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (err: any) {
		return new Response(JSON.stringify({ error: 'Invalid request body' }), {
			status: 400,
			headers: corsHeaders,
		});
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');

		if (!id) {
			return new Response(
				JSON.stringify({ error: 'ID tidak ditemukan dalam query parameter' }),
				{ status: 400, headers: corsHeaders }
			);
		}

		const { error } = await supabaseServer.from(TABLE_NAME).delete().eq('id', id);

		if (error) {
			return new Response(
				JSON.stringify({ error: error.message || 'Database error' }),
				{ status: 500, headers: corsHeaders }
			);
		}

		return new Response(
			JSON.stringify({ success: true, message: 'Data berhasil dihapus' }),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (err: any) {
		return new Response(JSON.stringify({ error: 'Invalid request body' }), {
			status: 400,
			headers: corsHeaders,
		});
	}
}