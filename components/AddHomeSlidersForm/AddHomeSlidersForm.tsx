'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { homeSliderSchema, HomeSliderFormData } from '@/app/schemas/homeSlidersSchema';
import ImageGalleryModalSlider from '@/components/ImageGalleryModalSlider/ImageGalleryModalSlider';

export default function AddHomeSliderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HomeSliderFormData>({
    resolver: zodResolver(homeSliderSchema),
    defaultValues: {
      featured: false,
      visible: false,
      image: '',
      bg_gradient: 'from-green-600 to-emerald-700',
    },
  });

  useEffect(() => {
    fetch('/api/home-sliders', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const count = data.filter((s: any) => s.featured).length;
        setActiveCount(count);
      })
      .catch(() => {
        toast.error("Gagal mengambil data slider");
      });
  }, []);

  const onSelectImage = (url: string) => {
    setImagePreview(url);
    setValue('image', url, { shouldValidate: true });
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setValue('image', '', { shouldValidate: true });
  };

  const onSubmit = async (data: HomeSliderFormData) => {
    if (data.featured && activeCount >= 5) {
      toast.error("Maksimal 5 slider aktif di halaman");
      return;
    }

    try {
      await toast.promise(
        fetch('/api/home-sliders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal menyimpan slider');
        }),
        {
          loading: 'Menyimpan slider...',
          success: () => {
            startTransition(() => router.push('/dashboard/home-sliders'));
            return 'Slider berhasil ditambahkan!';
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
        className="space-y-6 bg-white p-6 rounded shadow max-w-xl mx-0"
      >
        <h1 className="text-xl font-bold">Tambah Home Slider</h1>
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
          {errors.image && (
            <p className="text-sm text-red-500 mt-1">
              {errors.image.message}
            </p>
          )}
        </div>
        <div>
          <label className="block font-medium">Judul</label>
          <input
            {...register('title')}
            className="w-full border rounded px-3 py-2"
            placeholder="Judul slider"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Sub Judul</label>
          <input
            {...register('subtitle')}
            className="w-full border rounded px-3 py-2"
            placeholder="Sub judul slider"
          />
        </div>
        <div>
          <label className="block font-medium">Deskripsi</label>
          <textarea
            {...register('description')}
            className="w-full border rounded px-3 py-2"
            placeholder="Deskripsi singkat"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-medium">Teks Tombol</label>
          <input
            {...register('button_text')}
            className="w-full border rounded px-3 py-2"
            placeholder="Teks pada tombol"
          />
        </div>
        <div>
          <label className="block font-medium">Link Tombol</label>
          <input
            {...register('button_link')}
            className="w-full border rounded px-3 py-2"
            placeholder="https://... atau relative path (/path/...)"
          />
          {errors.button_link && (
            <p className="text-sm text-red-500">{errors.button_link.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('featured')} id="featured" />
          <label htmlFor="featured" className="cursor-pointer">
            Set Sebagai Fitur
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('visible')} id="visible" />
          <label htmlFor="visible" className="cursor-pointer">
            Tampilkan di slider
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

      <ImageGalleryModalSlider
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelectImage={onSelectImage}
      />
    </>
  );
}
