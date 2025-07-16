'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DetailDailyDakwahProps {
  id: string;
}

interface DailyDakwahData {
  title: string;
  description: string;
  image_url: string;
  published: boolean;
  created_at: string;
}

export default function DetailDailyDakwah({ id }: DetailDailyDakwahProps) {
  const [data, setData] = useState<DailyDakwahData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/daily-dakwah/${id}`);
        if (!res.ok) throw new Error('Gagal memuat detail');

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
            <Skeleton className="h-4 w-5/6 bg-muted-foreground/50 rounded" />
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
              src={data.image_url}
              alt={data.title}
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Judul</label>
            <p className="text-gray-800 font-semibold">{data.title}</p>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
            <p className="text-gray-700">{data.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded font-medium ${data.published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                }`}
            >
              {data.published ? 'Dipublikasikan' : 'Belum Dipublikasikan'}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-red-500">Data tidak ditemukan.</p>
      )}
    </div>
  );
}
