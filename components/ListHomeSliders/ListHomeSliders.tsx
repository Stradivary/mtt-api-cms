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
import { Switch } from "@/components/ui/switch";

type HomeSlider = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  visible: boolean;
  created_at: string;
};

export default function ListHomeSliders() {
  const [data, setData] = useState<HomeSlider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [toggleUpdatingId, setToggleUpdatingId] = useState<string | null>(null);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/home-sliders', { cache: 'no-store' });
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error('Gagal mengambil data slider');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisible = async (id: string, currentValue: boolean) => {
    setToggleUpdatingId(id);
    try {
      const res = await fetch(`/api/home-sliders/${id}/highlight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !currentValue }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.error || 'Gagal mengubah status tampil');
      } else {
        toast.success(`Slider berhasil ${!currentValue ? 'ditampilkan' : 'disembunyikan'}`);
        await fetchSliders();
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat update');
    } finally {
      setToggleUpdatingId(null);
    }
  };


  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingDelete(true);
    try {
      await toast.promise(
        fetch(`/api/home-sliders/${deleteId}`, { method: 'DELETE' }).then((res) => {
          if (!res.ok) throw new Error('Gagal menghapus slider');
          setData((prev) => prev.filter((item) => item.id !== deleteId));
        }),
        {
          loading: 'Menghapus slider...',
          success: 'Slider berhasil dihapus!',
          error: 'Gagal menghapus slider.',
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
    fetchSliders();
  }, []);

  const columns: ColumnDef<HomeSlider>[] = [
    {
      accessorKey: "title",
      header: "Judul",
      cell: ({ row }) => (
        <div className="w-[200px]">
          <div className="font-medium">{row.original.title}</div>
          {row.original.subtitle && (
            <div className="text-sm text-gray-500">{row.original.subtitle}</div>
          )}
          {row.original.description && (
            <div className="text-xs text-gray-400 line-clamp-2">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "image",
      header: "Gambar",
      cell: ({ row }) => (
        <div className="w-[100px]">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.title}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <span className="text-gray-400 text-sm italic">
              Tidak ada gambar
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => (
        <div className="w-[100px]">
          {dayjs(row.original.created_at).format("DD MMM YYYY")}
        </div>
      ),
    },
    {
      accessorKey: "visible",
      header: "Tampil",
      cell: ({ row }) => {
        const { id, visible } = row.original;
        return (
          <div className="flex justify-left">
            <Switch
              checked={visible}
              disabled={toggleUpdatingId === id}
              onCheckedChange={() => handleToggleVisible(id, visible)}
            />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/dashboard/home-sliders/${row.original.id}`}>
            <Button
              className='cursor-pointer'
              variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/home-sliders/${row.original.id}/edit`}>
            <Button
              className='cursor-pointer'
              variant="secondary" size="sm">
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
        title="Hapus Slider"
        description="Yakin ingin menghapus slider ini? Tindakan ini tidak dapat dibatalkan."
        loading={loadingDelete}
      />
      <DataTable
        title="Daftar Slider Beranda"
        data={data}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}
