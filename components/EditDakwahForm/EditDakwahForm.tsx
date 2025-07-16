'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { dakwahSchema, FormDailyDawahData } from '@/app/schemas/dailyDakwahScema';
import ImageGalleryModalDakwah from '@/components/ImageGalleryModalDakwah/ImageGalleryModalDakwah';
import { Skeleton } from '@/components/ui/skeleton';

interface EditDakwahFormProps {
  id: string;
}

export default function EditDakwahForm({ id }: EditDakwahFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormDailyDawahData>({
    resolver: zodResolver(dakwahSchema),
    defaultValues: {
      published: false,
      title: '',
      description: '',
      image_url: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/daily-dakwah/${id}`);
        if (!res.ok) throw new Error('Data tidak ditemukan');

        const data = await res.json();
        reset({
          title: data.title,
          description: data.description,
          published: data.published,
          image_url: data.image_url,
        });
        setImagePreview(data.image_url);
      } catch (err: any) {
        toast.error(err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

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
        fetch(`/api/daily-dakwah/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal memperbarui dakwah');
        }),
        {
          loading: 'Menyimpan perubahan...',
          success: () => {
            startTransition(() => router.push('/dashboard/daily-dakwah'));
            return 'Dakwah berhasil diperbarui!';
          },
          error: 'Terjadi kesalahan saat menyimpan.',
        }
      );
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-6 bg-white rounded shadow">
        <div>
          <Skeleton className="h-6 w-1/3" />
        </div>

        <div>
          <label className="block font-medium mb-1">Pilih Gambar</label>
          <Skeleton className="h-60 w-full rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">Judul Dakwah</label>
          <Skeleton className="h-10 w-full rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">Keterangan</label>
          <Skeleton className="h-24 w-full rounded" />
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-6 rounded shadow max-w-xl mx-auto"
      >
        <h1 className="text-xl font-bold">Edit Dakwah Harian</h1>

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
            <p className="text-sm text-red-500 mt-1">{errors.image_url.message}</p>
          )}
        </div>

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
            {isSubmitting || isPending ? 'Menyimpan...' : 'Perbarui'}
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
