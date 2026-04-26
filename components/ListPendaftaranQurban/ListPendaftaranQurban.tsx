'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { DataTable } from '../DataTable/DataTable';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { Button } from '../ui/button';
import { Download, Eye } from 'lucide-react';
import { ModalPreview } from '../ModalPreview/ModalPreview';

type PendaftaranQurban = {
	id: string;
	nama: string;
	hp: string;
	hewan: 'Kambing' | 'Sapi';
	qty: number;
	atas_nama: string;
	tujuan_qurban: string;
	lembaga: 'Baznas' | 'Lazismu';
	bukti_bayar_url: string | null;
	created_at: string;
};

export default function ListPendaftaranQurban() {
	const [data, setData] = useState<PendaftaranQurban[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [search, setSearch] = useState('');
	const [openPreview, setOpenPreview] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PendaftaranQurban | null>(null);
	const [loadingDownload, setLoadingDownload] = useState(false);

	const fetchPendaftaranQurban = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (search) params.append('search', search);

			const res = await fetch(`/api/pendaftaran-qurban?${params.toString()}`, {
				cache: 'no-store',
			});
			const json = await res.json();

			if (!Array.isArray(json?.data)) throw new Error('Invalid response format');

			setData(json.data);
		} catch {
			toast.error('Gagal mengambil data pendaftaran kurban');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPendaftaranQurban();
	}, [search]);

	const handleDownload = async () => {
		setLoadingDownload(true);
		toast.info('Sedang menyiapkan file Excel...');

		try {
			const response = await fetch('/api/pendaftaran-qurban/export-excel', {
				method: 'GET',
			});

			if (!response.ok) {
				throw new Error('Gagal download file');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = `pendaftaran-kurban-1447h-${new Date()
				.toISOString()
				.slice(0, 10)}.xlsx`;
			document.body.appendChild(a);
			a.click();
			a.remove();

			window.URL.revokeObjectURL(url);
			toast.success('Download berhasil!');
		} catch (error) {
			console.error('Error download:', error);
			toast.error('Download gagal, coba lagi!');
		} finally {
			setLoadingDownload(false);
		}
	};

	const columns: ColumnDef<PendaftaranQurban>[] = [
		{
			accessorKey: 'nama',
			header: 'Nama',
		},
		{
			accessorKey: 'hp',
			header: 'Nomor HP',
		},
		{
			accessorKey: 'hewan',
			header: 'Hewan',
		},
		{
			accessorKey: 'qty',
			header: 'Qty',
		},
		{
			accessorKey: 'atas_nama',
			header: 'Atas Nama',
		},
		{
			accessorKey: 'tujuan_qurban',
			header: 'Tujuan Qurban',
		},
		{
			accessorKey: 'lembaga',
			header: 'Lembaga',
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
							onClick={() => {
								setSelectedItem(row.original);
								setOpenPreview(true);
							}}
						>
							<Eye className="w-4 h-4" />
						</Button>
					</div>
				);
			},
		},
	];

	return (
		<div className="space-y-4">
			<ModalPreview
				open={openPreview}
				onClose={() => setOpenPreview(false)}
				title="Detail Pendaftaran Kurban"
			>
				<div className="flex flex-col text-sm gap-3">
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Nama</div>
						<div>: {selectedItem?.nama}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Nomor HP</div>
						<div>: {selectedItem?.hp}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Hewan</div>
						<div>: {selectedItem?.hewan}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Qty</div>
						<div>: {selectedItem?.qty}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Atas Nama</div>
						<div>: {selectedItem?.atas_nama}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Tujuan Qurban</div>
						<div>: {selectedItem?.tujuan_qurban}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Lembaga</div>
						<div>: {selectedItem?.lembaga}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Tanggal</div>
						<div>: {dayjs(selectedItem?.created_at).format('DD MMM YYYY')}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Bukti Bayar</div>
						<div>
							: {selectedItem?.bukti_bayar_url ? (
								<a
									href={selectedItem.bukti_bayar_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 underline"
								>
									Lihat Bukti Bayar
								</a>
							) : (
								<span>-</span>
							)}
						</div>
					</div>
				</div>
			</ModalPreview>

			<div className="flex items-center gap-2 justify-between">
				<Input
					placeholder="Cari nama atau no hp..."
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
					{loadingDownload ? 'Mengunduh...' : 'Download Semua'}
				</Button>
			</div>

			<DataTable
				title="Daftar Pendaftaran Kurban"
				data={data}
				columns={columns}
				loading={loading}
			/>
		</div>
	);
}
