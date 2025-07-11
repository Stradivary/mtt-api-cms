'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '../DataTable/DataTable';
import { toast } from 'sonner';
import { ModalConfirm } from '@/components/ModalConfirm/ModalConfirm';
import { getPublicImageUrl } from '@/lib/supabase-url';

type News = {
  id: string;
  title: string;
  content: string;
  image_path: string;
  category_id: string;
  category_name: string;
  created_at: string;
  image: string;
};

export default function ListNews() {
  const [data, setData] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const json = await res.json();

      const processed = json.map((n: any) => ({
        ...n,
        image: getPublicImageUrl(n.image_path),
      }));

      setData(processed);
    } catch (err) {
      toast.error('Gagal mengambil data berita');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingDelete(true);
    try {
      await toast.promise(
        fetch(`/api/news/${deleteId}`, {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal menghapus berita');
          setData((prev) => prev.filter((item) => item.id !== deleteId));
          fetchNews();
        }),
        {
          loading: 'Menghapus berita...',
          success: 'Berita berhasil dihapus!',
          error: 'Gagal menghapus berita.',
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDelete(false);
      setDeleteId(null);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ getValue }) => (
        <div className="line-clamp-2 max-w-auto">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'image',
      header: 'Gambar',
      cell: ({ row }) => (
        <div className="w-[100px]">
          <img
            src={row.original.image}
            alt={row.original.title}
            className="w-12 h-12 object-cover rounded"
          />
        </div>
      ),
    },
    {
      accessorKey: 'category_name',
      header: 'Kategori',
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal',
      cell: ({ row }) => (
        <div className="w-[100px]">
          {dayjs(row.original.created_at).format('DD MMM YYYY')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right w-auto">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2 w-auto">
          <Link href={`/dashboard/news/${row.original.id}`}>
            <Button className="cursor-pointer" variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/news/${row.original.id}/edit`}>
            <Button className="cursor-pointer" variant="secondary" size="sm">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            className="cursor-pointer"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ModalConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Berita"
        description="Yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan."
        loading={loadingDelete}
      />
      <DataTable
        title="Daftar Berita"
        data={data}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}
