'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '../DataTable/DataTable';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { Button } from '../ui/button';
import { Download, Eye, Trash2 } from 'lucide-react';
import { ModalConfirm } from '../ModalConfirm/ModalConfirm';
import { ModalPreview } from '../ModalPreview/ModalPreview';

type Zakat = {
  id: string;
  name: string;
  nik: string;
  unit_kerja: string;
  email: number;
  telepon: string;
  created_at: string;
};

export default function ListZakat() {
  const [data, setData] = useState<Zakat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [openPreview, setOpenPreview] = useState(false);
  const [selectedZakat, setSelectedZakat] = useState<Zakat | null>(null);

  const handleDownload = async () => {
    setLoadingDownload(true);
    toast.info("Sedang menyiapkan file Excel...");

    try {
      const response = await fetch("/api/zakat-registration/export-excel", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Gagal download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `zakat-data-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Download berhasil!");
    } catch (error) {
      console.error("Error download:", error);
      toast.error("Download gagal, coba lagi!");
    } finally {
      setLoadingDownload(false);
    }
  };

  const fetchZakat = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await fetch(`/api/zakat-registration?${params.toString()}`, {
        cache: 'no-store',
      });
      const json = await res.json();

      if (!Array.isArray(json?.data)) throw new Error('Invalid response format');

      setData(json.data);
    } catch (err) {
      toast.error('Gagal mengambil data zakat');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (data: Zakat) => {
    setSelectedZakat(data);
    setOpenPreview(true);
  };

  useEffect(() => {
    fetchZakat();
  }, [search]);

  const columns: ColumnDef<Zakat>[] = [
    {
      accessorKey: 'name',
      header: 'Nama',
    },
    {
      accessorKey: 'nik',
      header: 'NIK',
    },
    {
      accessorKey: 'unit_kerja',
      header: 'Unit Kerja',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'telepon',
      header: 'Telepon',
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal',
      cell: ({ row }) => (
        <div className="w-[120px]">
          {dayjs(row.original.created_at).format('DD MMM YYYY')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePreview(row.original)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              className="cursor-pointer"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];
  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingDelete(true);
    try {
      await toast.promise(
        fetch(`/api/zakat-registration/${deleteId}`, {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }).then((res) => {
          if (!res.ok) throw new Error('Gagal menghapus data zakat');
          setData((prev) => prev.filter((item) => item.id !== deleteId));
          fetchZakat();
        }),
        {
          loading: 'Menghapus data zakat...',
          success: 'Data zakat berhasil dihapus!',
          error: 'Gagal menghapus data zakat.',
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDelete(false);
      setDeleteId(null);
    }
  };


  return (
    <div className="space-y-4">
      <ModalPreview open={openPreview} onClose={() => setOpenPreview(false)} title="Detail Zakat">
        <div className="flex flex-col text-sm gap-3">
          <div className='flex flex-row'>
            <div className="font-semibold w-[20%]">Nama</div>
            <div>: {selectedZakat?.name}</div>
          </div>
          <div className='flex flex-row '>
            <div className="font-semibold w-[20%]">Nik</div>
            <div>: {selectedZakat?.nik}</div>
          </div>
          <div className='flex flex-row'>
            <div className="font-semibold w-[20%]">Unit Kerja</div>
            <div>: {selectedZakat?.unit_kerja}</div>
          </div>
          <div className='flex flex-row'>
            <div className="font-semibold w-[20%]">Email</div>
            <div>: {selectedZakat?.email}</div>
          </div>
          <div className='flex flex-row'>
            <div className="font-semibold w-[20%]">Tipe</div>
            <div>: {selectedZakat?.telepon}</div>
          </div>
          <div className='flex flex-row'>
            <div className="font-semibold w-[20%]">Tanggal</div>
            <div>: {dayjs(selectedZakat?.created_at).format('DD MMM YYYY')}</div>
          </div>
        </div>
      </ModalPreview>
      <ModalConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Data Zakat"
        description="Yakin ingin menghapus data zakat ini? Tindakan ini tidak dapat dibatalkan."
        loading={loadingDelete}
      />
      <div className="flex items-center gap-2 justify-between">
        <Input
          placeholder="Cari nama atau email..."
          className="max-w-xs"
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            if (value.length > 3) {
              setSearch(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearch(searchQuery);
            }
          }}
        />
        <Button
          onClick={handleDownload}
          disabled={loadingDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {loadingDownload ? "Mengunduh..." : "Download Semua"}
        </Button>
      </div>
      <DataTable
        title="Daftar Zakat Masuk"
        data={data}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}
