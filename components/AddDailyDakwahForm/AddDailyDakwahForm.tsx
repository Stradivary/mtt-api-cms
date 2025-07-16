'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { dakwahSchema, FormDailyDawahData } from '@/app/schemas/dailyDakwahScema';
import ImageGalleryModalDakwah from '@/components/ImageGalleryModalDakwah/ImageGalleryModalDakwah';

export default function DakwahForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormDailyDawahData>({
    resolver: zodResolver(dakwahSchema),
    defaultValues: {
      published: false,
      image_url: '',
    },
  });

  const onSelectImage = (url: string) => {
    setImagePreview(url);
    setValue('image_url', url, { shouldValidate: true });
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setValue('image_url', '', { shouldValidate: true });
  };

  const onSubmit = async (data: FormDailyDawahData) => {
    try {
      await toast.promise(
        fetch('/api/daily-dakwah', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal menyimpan dakwah');
        }),
        {
          loading: 'Menyimpan dakwah...',
          success: () => {
            startTransition(() => router.push('/dashboard/daily-dakwah'));
            return 'Dakwah berhasil ditambahkan!';
          },
          error: 'Terjadi kesalahan saat menyimpan.',
        }
      );
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-6 rounded shadow max-w-xl mx-auto"
      >
        <h1 className="text-xl font-bold">Tambah Dakwah Harian</h1>

        {/* Pilih Gambar */}
        <div>
          <label className="block font-medium mb-1">Pilih Gambar</label>
          <div
            className="border rounded p-4 bg-gray-50 flex items-center justify-center h-60 cursor-pointer relative group"
            onClick={() => setShowModal(true)}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-cover h-full w-full rounded"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1 hidden group-hover:flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearImage();
                  }}
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <ImageIcon className="text-gray-400 w-12 h-12" />
            )}
          </div>
          {errors.image_url && (
            <p className="text-sm text-red-500 mt-1">
              {errors.image_url.message}
            </p>
          )}
        </div>

        {/* Judul */}
        <div>
          <label className="block font-medium">Judul Dakwah</label>
          <input
            {...register('title')}
            className="w-full border rounded px-3 py-2"
            placeholder="Judul dakwah harian"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Keterangan</label>
          <textarea
            {...register('description')}
            className="w-full border rounded px-3 py-2"
            placeholder="Isi keterangan singkat dakwah (maks. 120 karakter)"
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('published')} id="published" />
          <label htmlFor="published" className="cursor-pointer">
            Publikasikan sekarang
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isSubmitting || isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>

      <ImageGalleryModalDakwah
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelectImage={onSelectImage}
      />
    </>
  );
}
