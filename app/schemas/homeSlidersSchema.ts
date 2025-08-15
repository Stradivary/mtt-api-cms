import { z } from "zod";

export const homeSliderSchema = z.object({
  image: z.string().url("Gambar wajib diisi dan harus berupa URL yang valid"),
  title: z.string().min(1, "Judul wajib diisi"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  button_text: z.string().optional(),
  button_link: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^\/[a-zA-Z0-9/_-]+$/.test(val) || /^https?:\/\//.test(val),
      {
        message:
          'Format buttonLink harus berupa URL absolute (https://...) atau relative path (/path/...)',
      }
    ),
  bg_gradient: z.string().optional(),
  featured: z.boolean().optional(),
  visible: z.boolean().optional(),
});

export type HomeSliderFormData = z.infer<typeof homeSliderSchema>;
