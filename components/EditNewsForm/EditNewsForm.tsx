'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ImageIcon } from 'lucide-react';
import TextEditor from '../TextEditor/TextEditor';
import { toast } from 'sonner';
import { uploadToSupabase } from '@/lib/uploadToSupabase';
import { getPublicImageUrl } from '@/lib/supabase-url';
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
  image: z.any().optional(),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  category_name: z.string().min(1),
});

type FormData = z.infer<typeof newsSchema>;

export default function EditNewsForm({ id }: { id: string }) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialImagePath, setInitialImagePath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(newsSchema),
  });

  // Fetch kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        setCategories(data);
      } catch {
        toast.error('Gagal mengambil data kategori');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) {
        toast.error('Gagal mengambil data berita');
        return;
      }
      const data = await res.json();
      setValue('title', data.title);
      setValue('content', data.content);
      setValue('category_id', data.category_id);
      setValue('category_name', data.category_name);
      setInitialImagePath(data.image_path);
      setImagePreview(getPublicImageUrl(data.image_path));
    };

    fetchNews();
  }, [id, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let imagePath = initialImagePath;

      const file = (data.image as FileList)?.[0];
      if (file) {
        imagePath = await uploadToSupabase(file);
      }

      await toast.promise(
        fetch(`/api/news/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            imagePath,
            category_id: data.category_id,
            category_name: data.category_name,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal mengupdate berita');
        }),
        {
          loading: 'Menyimpan perubahan...',
          success: () => {
            startTransition(() => router.push('/dashboard/news'));
            return 'Berita berhasil diperbarui!';
          },
          error: (err) =>
            err.message || 'Terjadi kesalahan saat menyimpan perubahan.',
        }
      );
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded shadow"
    >
      <h1 className="text-xl font-bold">Edit Berita</h1>

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
          className="mt-2 block w-full border rounded px-3 py-2"
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

      {/* Kategori */}
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
          {isSubmitting || isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}
