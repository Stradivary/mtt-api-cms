import { z } from "zod";

export const newsSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().min(10, "Isi berita minimal 10 karakter"),
  image: z.string().url("URL gambar tidak valid"),
});

export type NewsSchema = z.infer<typeof newsSchema>;
