'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { ImageIcon } from 'lucide-react';
import TextEditor from '../TextEditor/TextEditor';
import { toast } from 'sonner';
import { uploadToSupabase } from '@/lib/uploadToSupabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const newsSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  content: z.string().min(10, 'Isi berita minimal 10 karakter'),
  image: z
    .any()
    .refine((file) => file instanceof FileList && file.length > 0, {
      message: 'Gambar wajib diunggah',
    }),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  category_name: z.string().min(1),
});

type FormData = z.infer<typeof newsSchema>;

export default function NewsForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(newsSchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        toast.error('Gagal mengambil data kategori');
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const imageFile = data.image[0];
      const supabasePath = await uploadToSupabase(imageFile);

      await toast.promise(
        fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            imagePath: supabasePath,
            category_id: data.category_id,
            category_name: data.category_name,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal menyimpan berita');
        }),
        {
          loading: 'Menyimpan berita...',
          success: () => {
            startTransition(() => router.push('/dashboard/news'));
            return 'Berita berhasil disimpan!';
          },
          error: (err) =>
            err.message || 'Terjadi kesalahan saat menyimpan berita.',
        }
      );
    } catch (err: any) {
      toast.error(err.message || 'Gagal upload gambar.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded shadow"
    >
      <h1 className="text-xl font-bold">Tambah Berita Baru</h1>

      {/* Upload Gambar */}
      <div>
        <label className="block font-medium mb-1">Upload Gambar</label>
        <div className="border rounded p-4 bg-gray-50 flex items-center justify-center h-60">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="object-cover h-full w-full rounded"
            />
          ) : (
            <ImageIcon className="text-gray-400 w-12 h-12" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          {...register('image')}
          onChange={handleImageChange}
          className="mt-2 block w-full border rounded px-3 py-2 cursor-pointer"
        />
        {errors.image && (
          <p className="text-sm text-red-500">{String(errors.image.message)}</p>
        )}
      </div>
      <div>
        <label className="block font-medium">Judul</label>
        <input
          {...register('title')}
          className="w-full border rounded px-3 py-2"
          placeholder="Judul berita"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium mb-1">Kategori</label>
        <Controller
          name="category_id"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val);
                const selected = categories.find((c) => c.id === val);
                if (selected) {
                  setValue('category_name', selected.name);
                }
              }}
            >
              <SelectTrigger className="w-full text-[16px]">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category_id && (
          <p className="text-sm text-red-500 mt-1">{errors.category_id.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium mb-1">Isi Berita</label>
        <Controller
          name="content"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextEditor value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.content && (
          <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
        >
          {isSubmitting || isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
