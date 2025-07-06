'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ImageIcon } from 'lucide-react';
import TextEditor from '../TextEditor/TextEditor';
import { toast } from 'sonner';

const newsSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  content: z.string().min(10, 'Isi berita minimal 10 karakter'),
  image: z.any().optional(),
});

type FormData = z.infer<typeof newsSchema>;

export default function EditNewsForm({ id }: { id: string }) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(newsSchema),
  });

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
      setImagePreview(data.image);
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

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    const file = (data.image as FileList)?.[0];
    if (file) formData.append('image', file);

    toast.promise(
      fetch(`/api/news/${id}`, {
        method: 'PATCH',
        body: formData,
      }).then((res) => {
        if (!res.ok) throw new Error('Gagal mengupdate berita');
      }),
      {
        loading: 'Menyimpan perubahan...',
        success: () => {
          startTransition(() => router.push('/news'));
          return 'Berita berhasil diperbarui!';
        },
        error: (err) => err.message || 'Terjadi kesalahan saat menyimpan perubahan.',
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded shadow"
      encType="multipart/form-data"
    >
      <h1 className="text-xl font-bold">Edit Berita</h1>

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
        {errors.image && <p className="text-sm text-red-500">{String(errors.image.message)}</p>}
      </div>

      <div>
        <label className="block font-medium">Judul</label>
        <input
          {...register('title')}
          className="w-full border rounded px-3 py-2"
          placeholder="Judul berita"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
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
