import { z } from 'zod';

export const MAX_FILE_SIZE = 1 * 1024 * 1024;

export const ALLOWED_BUKTI_BAYAR_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'application/pdf',
] as const;

export const PROVINSI_INDONESIA = [
	'Aceh',
	'Sumatera Utara',
	'Sumatera Barat',
	'Riau',
	'Kepulauan Riau',
	'Jambi',
	'Sumatera Selatan',
	'Kepulauan Bangka Belitung',
	'Bengkulu',
	'Lampung',
	'DKI Jakarta',
	'Jawa Barat',
	'Banten',
	'Jawa Tengah',
	'DI Yogyakarta',
	'Jawa Timur',
	'Bali',
	'Nusa Tenggara Barat',
	'Nusa Tenggara Timur',
	'Kalimantan Barat',
	'Kalimantan Tengah',
	'Kalimantan Selatan',
	'Kalimantan Timur',
	'Kalimantan Utara',
	'Sulawesi Utara',
	'Gorontalo',
	'Sulawesi Tengah',
	'Sulawesi Barat',
	'Sulawesi Selatan',
	'Sulawesi Tenggara',
	'Maluku',
	'Maluku Utara',
	'Papua',
	'Papua Barat',
	'Papua Selatan',
	'Papua Tengah',
	'Papua Pegunungan',
	'Papua Barat Daya',
] as const;

const buktiBayarSchema = z.string().url('URL bukti bayar tidak valid').optional().nullable();

const qurbanItemSchema = z.object({
	hewan: z.enum(['Kambing', 'Sapi'], {
		errorMap: () => ({ message: 'Pilih hewan qurban' }),
	}),
	qty: z
		.string()
		.min(1, 'Qty wajib diisi')
		.regex(/^\d+$/, 'Qty harus angka')
		.refine((value) => Number(value) > 0, 'Qty harus lebih dari 0'),
	atasNama: z.string().min(1, 'Atas nama wajib diisi'),
	atasNamaList: z.array(z.string().min(1)).min(1, 'Minimal ada satu nama dalam daftar'),
});

export const pendaftaranQurbanSchema = z.object({
	nama: z.string().min(1, 'Nama wajib diisi'),
	email: z.string().email('Email tidak valid'),
	hp: z
		.string()
		.min(1, 'Nomor HP wajib diisi')
		.regex(/^\d+$/, 'Nomor HP harus angka'),
	qurbanItems: z.array(qurbanItemSchema).min(1, 'Minimal ada satu item qurban'),
	tujuanQurban: z
		.string()
		.min(1, 'Tujuan qurban wajib dipilih')
		.refine(
			(value) => value === 'Ikut Panitia' || PROVINSI_INDONESIA.includes(value as (typeof PROVINSI_INDONESIA)[number]),
			'Tujuan qurban tidak valid'
		),
	lembaga: z.string().min(1, 'Lembaga wajib diisi'),
	buktiBayarUrl: buktiBayarSchema,
});

export type PendaftaranQurbanData = z.infer<typeof pendaftaranQurbanSchema>;
