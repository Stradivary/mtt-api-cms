'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DetailHomeSliderProps {
  id: string;
}

interface HomeSliderData {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  button_text?: string;
  button_link?: string;
  visible: boolean;
  featured: boolean;
  created_at: string;
}

export default function DetailHomeSlider({ id }: DetailHomeSliderProps) {
  const [data, setData] = useState<HomeSliderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/home-sliders/${id}`);
        if (!res.ok) throw new Error('Gagal memuat detail slider');

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        toast.error(err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-md shadow max-w-3xl mx-auto">
      {loading ? (
        <div className="space-y-6">
          <div className="w-full h-60 rounded-md border bg-muted">
            <Skeleton className="w-full h-full rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-muted-foreground/50 rounded" />
            <Skeleton className="h-6 w-2/3 bg-muted-foreground/50 rounded" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-muted-foreground/50 rounded" />
            <Skeleton className="h-4 w-full bg-muted-foreground/50 rounded" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-muted-foreground/50 rounded" />
            <Skeleton className="h-6 w-1/3 bg-muted-foreground/50 rounded" />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="w-full h-60 overflow-hidden rounded-md border bg-white">
            <img
              src={data.image}
              alt={data.title}
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Judul</label>
            <p className="text-gray-800 font-semibold">{data.title}</p>
          </div>

          {data.subtitle && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sub Judul</label>
              <p className="text-gray-700">{data.subtitle}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Dibuat</label>
            <p className="text-gray-700">
              {new Date(data.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {data.description && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
              <p className="text-gray-700">{data.description}</p>
            </div>
          )}

          {data.button_text && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tombol</label>
              <p className="text-gray-700">
                {data.button_text} {data.button_link && `(${data.button_link})`}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status Tampil</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded font-medium ${
                data.visible
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {data.visible ? 'Tampil' : 'Tidak Tampil'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Featured</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded font-medium ${
                data.featured
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {data.featured ? 'Ya' : 'Tidak'}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-red-500">Data tidak ditemukan.</p>
      )}
    </div>
  );
}
