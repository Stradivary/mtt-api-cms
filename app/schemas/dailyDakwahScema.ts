import { z } from 'zod';

export const dakwahSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul wajib diisi')
    .max(32, 'Maksimum 32 karakter')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Hanya huruf, angka, dan spasi'),

  description: z
    .string()
    .min(1, 'Keterangan wajib diisi')
    .max(120, 'Maksimum 120 karakter')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Hanya huruf, angka, dan spasi'),

  image_url: z
    .string()
    .min(1, 'Gambar wajib dipilih')
    .url('Format URL gambar tidak valid'),

  published: z.boolean(),
});

export type FormDailyDawahData = z.infer<typeof dakwahSchema>;
