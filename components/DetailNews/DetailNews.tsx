'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { getPublicImageUrl } from '@/lib/supabase-url';

type News = {
  id: string;
  title: string;
  content: string;
  image_path: string;
  createdAt: string;
};

export default function DetailsNews({ id }: { id: string }) {
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news/${id}`);
        if (!res.ok) {
          router.push('/not-found');
          return;
        }
        const json: News = await res.json();
        setNews(json);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
        router.push('/not-found');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, router]);

  if (loading) return <div className="p-6">Memuat berita...</div>;
  if (!news) return <div className="p-6 text-red-500">Berita tidak ditemukan.</div>;

  const imageUrl = news.image_path ? getPublicImageUrl(news.image_path) : null;

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      {imageUrl && (
        <div className="border rounded p-4 bg-gray-50 flex items-center justify-center h-60">
          <img
            src={imageUrl}
            alt={news.title}
            className="object-cover h-full w-full rounded"
          />
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{news.title}</h1>
        <p className="text-sm text-gray-500">
          Dipublikasikan pada: {dayjs(news.createdAt).format('DD MMMM YYYY')}
        </p>
      </div>

      <div className="prose max-w-none text-gray-800">
        <div dangerouslySetInnerHTML={{ __html: news.content }} />
      </div>
    </div>
  );
}
