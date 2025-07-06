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

type News = {
  id: string;
  title: string;
  content: string;
  image: string;
  createdAt: string;
};

export default function HomePage() {
  const [data, setData] = useState<News[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const fetchNews = async () => {
    const res = await fetch('/api/news');
    const json = await res.json();
    setData(json);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingDelete(true);
    try {
      await toast.promise(
        fetch(`/api/news/${deleteId}`, { method: 'DELETE' }).then((res) => {
          if (!res.ok) throw new Error('Gagal menghapus berita');
        }),
        {
          loading: 'Menghapus berita...',
          success: 'Berita berhasil dihapus!',
          error: 'Gagal menghapus berita.',
        }
      );
      fetchNews();
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
        <div className="line-clamp-2 max-w-auto">
          {getValue() as string}
        </div>
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
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => (
        <div className='w-[100px]'>
          {dayjs(row.original.createdAt).format('DD MMM YYYY')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right w-auto">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2 w-auto">
          <Link href={`/news/${row.original.id}`}>
            <Button className='cursor-pointer' variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/news/${row.original.id}/edit`}>
            <Button className='cursor-pointer' variant="secondary" size="sm">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            className='cursor-pointer'
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
      />
    </div>
  );
}
