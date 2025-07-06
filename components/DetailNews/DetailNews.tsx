import { notFound } from 'next/navigation';
import dayjs from 'dayjs';

type News = {
  id: string;
  title: string;
  content: string;
  image: string;
  createdAt: string;
};

async function getNews(id: string): Promise<News | null> {
  const res = await fetch(`http://localhost:3000/api/news/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DetailsNews({ id }: { id: string }) {
  const news = await getNews(id);
  if (!news) return notFound();

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      {/* Gambar di atas */}
      {news.image && (
        <div className="border rounded p-4 bg-gray-50 flex items-center justify-center h-60">
          <img
            src={news.image}
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
