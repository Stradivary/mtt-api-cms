'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ImageGalleryModalSlider from '@/components/ImageGalleryModalSlider/ImageGalleryModalSlider';
import { homeSliderSchema, HomeSliderFormData } from '@/app/schemas/homeSlidersSchema';

interface EditHomeSliderProps {
  id: string;
}

export default function EditHomeSlider({ id }: EditHomeSliderProps) {
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
  } = useForm<HomeSliderFormData>({
    resolver: zodResolver(homeSliderSchema),
    defaultValues: {
      image: '',
      title: '',
      subtitle: '',
      description: '',
      button_text: '',
      button_link: '',
      bg_gradient: '',
      featured: false,
      visible: true,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/home-sliders/${id}`);
        if (!res.ok) throw new Error('Data tidak ditemukan');

        const data = await res.json();
        reset(data);
        setImagePreview(data.image);
      } catch (err: any) {
        toast.error(err.message || 'Gagal memuat data slider');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSelectImage = (url: string) => {
    setImagePreview(url);
    setValue('image', url, { shouldValidate: true });
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setValue('image', '', { shouldValidate: true });
  };

  const onSubmit = async (data: HomeSliderFormData) => {
    try {
      await toast.promise(
        fetch(`/api/home-sliders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal memperbarui slider');
        }),
        {
          loading: 'Menyimpan perubahan...',
          success: () => {
            startTransition(() => router.push('/dashboard/home-sliders'));
            return 'Slider berhasil diperbarui!';
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
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-60 w-full rounded" />
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-24 w-full rounded" />
        <Skeleton className="h-10 w-1/3 rounded" />
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-6 rounded shadow max-w-xl mx-0"
      >
        <h1 className="text-xl font-bold">Edit Home Slider</h1>

        <div>
          <label className="block font-medium mb-1">Pilih Gambar</label>
          <div
            className="border rounded p-4 bg-gray-50 flex items-center justify-center h-60 cursor-pointer relative group"
            onClick={() => setShowModal(true)}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="object-cover h-full w-full rounded" />
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
          {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Judul</label>
          <input {...register('title')} className="w-full border rounded px-3 py-2" />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Subtitle</label>
          <input {...register('subtitle')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium">Deskripsi</label>
          <textarea {...register('description')} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <div>
          <label className="block font-medium">Teks Tombol</label>
          <input {...register('button_text')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium">Link Tombol</label>
          <input {...register('button_link')} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('featured')} /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('visible')} /> Tampilkan
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

      <ImageGalleryModalSlider
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelectImage={onSelectImage}
      />
    </>
  );
}
