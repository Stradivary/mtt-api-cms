import { corsHeaders } from '@/lib/cors';
import { supabaseServer } from '@/lib/supabase-server';

export async function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: corsHeaders,
	});
}

export async function GET() {
	const { data, error } = await supabaseServer
		.from('daily_dakwah')
		.select('*')
		.eq('highlight', true)
		.order('created_at', { ascending: false });

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
