'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTable } from '../DataTable/DataTable';
import { toast } from 'sonner';
import { Download, Eye } from 'lucide-react';
import dayjs from 'dayjs';
import { PdfPreview } from '../FdfPreview/PdfPreview';

type Proposal = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  file_url: string;
  is_read: boolean;
  created_at: string;
};

export default function ListProposal() {
  const [data, setData] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (search) params.append('search', search);
      if (statusFilter === 'read') params.append('isRead', 'true');
      else if (statusFilter === 'unread') params.append('isRead', 'false');

      const res = await fetch(`/api/proposal?${params.toString()}`, {
        cache: 'no-store'
      });
      const json = await res.json();

      if (!Array.isArray(json?.data)) throw new Error('Invalid response format');

      setData(json.data);
    } catch (err) {
      toast.error('Gagal mengambil data proposal');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/proposal/${id}/read`, {
        method: 'PATCH'
      });
      setIsDownloaded(false);
      fetchProposals();

    } catch {
      toast.error('Gagal update status dibaca');
      setIsDownloaded(false);
    }
  };

  const handlePreview = (url: string, id:string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
    markAsRead(id);
  };

  const handleDownload = async (url: string, filename: string, id: string, isRead: boolean) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      if (!isRead) {
        setIsDownloaded(true);
        markAsRead(id);
      } else {
        toast.info('Proposal sudah pernah dibaca');
        setIsDownloaded(false);

      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('gagal update status atau download proposal');
      setIsDownloaded(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [search, statusFilter]);

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: 'name',
      header: 'Nama',
      cell: ({ getValue }) => (
        <div className="line-clamp-1">{getValue() as string}</div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'phone_number',
      header: 'Telepon'
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal',
      cell: ({ row }) => (
        <div className="w-[100px]">
          {dayjs(row.original.created_at).format('DD MMM YYYY')}
        </div>
      )
    },
    {
      accessorKey: 'is_read',
      header: 'Status',
      cell: ({ getValue }) => {
        const isRead = getValue() as boolean;
        return (
          <span className={isRead ? 'text-green-600 font-medium' : 'text-gray-500 italic'}>
            {isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const proposal = row.original;
        const disabled = row.original.file_url === '';

        return (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePreview(proposal.file_url, proposal.id)}
              disabled={disabled}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={isDownloaded || disabled}
              onClick={() =>
                handleDownload(
                  proposal.file_url,
                  `Proposal-${proposal.name}-${proposal.file_url.split('/').pop()}`,
                  proposal.id,
                  proposal.is_read
                )
              }
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    }
  ];

  return (
    <>
      <PdfPreview
        isOpen={isPreviewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={previewUrl}
      />
      <div className="space-y-4">
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
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="read">Sudah Dibaca</SelectItem>
              <SelectItem value="unread">Belum Dibaca</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable
          title="Daftar Proposal Masuk"
          data={data}
          columns={columns}
          loading={loading}
        />
      </div>
    </>
  );
}
