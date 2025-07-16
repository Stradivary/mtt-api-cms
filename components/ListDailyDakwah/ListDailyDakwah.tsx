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

type Dakwah = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  published: boolean;
  created_at: string;
  highlight: boolean;
};

export default function ListDailyDakwah() {
  const [data, setData] = useState<Dakwah[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [highlightUpdatingId, setHighlightUpdatingId] = useState<string | null>(null);

  const handleToggleHighlight = async (id: string, currentValue: boolean) => {
    setHighlightUpdatingId(id);
  
    try {
      const res = await fetch(`/api/daily-dakwah/${id}/highlight`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlight: !currentValue }),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        toast.error(result?.error || 'Gagal mengubah highlight');
      } else {
        await fetchDakwah();
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat update highlight');
    } finally {
      setHighlightUpdatingId(null);
    }
  };
  

  const fetchDakwah = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-dakwah', { cache: 'no-store' });
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error('Gagal mengambil data dakwah');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingDelete(true);
    try {
      await toast.promise(
        fetch(`/api/daily-dakwah/${deleteId}`, {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal menghapus dakwah');
          setData((prev) => prev.filter((item) => item.id !== deleteId));
          fetchDakwah();
        }),
        {
          loading: 'Menghapus dakwah...',
          success: 'Dakwah berhasil dihapus!',
          error: 'Gagal menghapus dakwah.',
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
    fetchDakwah();
  }, []);

  const columns: ColumnDef<Dakwah>[] = [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ getValue }) => (
        <div className="line-clamp-2">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'image_url',
      header: 'Gambar',
      cell: ({ row }) => (
        <div className="w-[100px]">
          {row.original.image_url ? (
            <img
              src={row.original.image_url}
              alt={row.original.title}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <span className="text-gray-400 text-sm italic">Tidak ada gambar</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'published',
      header: 'Status',
      cell: ({ getValue }) => (
        <span
          className={
            getValue() ? 'text-green-600 font-medium' : 'text-gray-500 italic'
          }
        >
          {getValue() ? 'Dipublikasikan' : 'Draft'}
        </span>
      ),
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
      accessorKey: 'highlight',
      header: () => <div className="text-center">Highlight</div>,
      cell: ({ row }) => {
        const { id, highlight } = row.original;
        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={highlight}
              disabled={highlightUpdatingId === id}
              onChange={() => handleToggleHighlight(id, highlight)}
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/dashboard/daily-dakwah/${row.original.id}`}>
            <Button className="cursor-pointer" variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/daily-dakwah/${row.original.id}/edit`}>
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
        title="Hapus Dakwah"
        description="Yakin ingin menghapus dakwah ini? Tindakan ini tidak dapat dibatalkan."
        loading={loadingDelete}
      />
      <DataTable
        title="Daftar Dakwah Harian"
        data={data}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}
