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
	email: string;
	hp: string;
	qurban_items: Array<{
		hewan: 'Kambing' | 'Sapi';
		qty: string;
		atasNama: string;
		atasNamaList: string[];
	}>;
	tujuan_qurban: string;
	lembaga: string;
	bukti_bayar_url: string | null;
	created_at: string;
};

export default function ListPendaftaranQurban() {
	const PAGE_SIZE = 10;

	const [data, setData] = useState<PendaftaranQurban[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [openPreview, setOpenPreview] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PendaftaranQurban | null>(null);
	const [loadingDownload, setLoadingDownload] = useState(false);

	const fetchPendaftaranQurban = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (search) params.append('search', search);
			params.append('page', String(page));
			params.append('limit', String(PAGE_SIZE));

			const res = await fetch(`/api/pendaftaran-qurban?${params.toString()}`, {
				cache: 'no-store',
			});
			const json = await res.json();

			if (!Array.isArray(json?.data)) throw new Error('Invalid response format');

			setData(json.data);
			const parsedTotal = Number(json?.total);
			const totalFromApi = Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : 0;
			setTotalItems(Math.max(totalFromApi, (page - 1) * PAGE_SIZE + json.data.length));
		} catch {
			toast.error('Gagal mengambil data pendaftaran kurban');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPendaftaranQurban();
	}, [search, page]);

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
			accessorKey: 'email',
			header: 'Email',
		},
		{
			accessorKey: 'hp',
			header: 'Nomor HP',
		},
		{
			id: 'qurban_items',
			header: 'Qurban Items',
			cell: ({ row }) => {
				const items = row.original.qurban_items || [];
				if (items.length === 0) return <span>-</span>;
				const visibleItems = items.slice(0, 3);
				const hasMore = items.length > 3;
				return (
					<div className="min-w-[280px] text-sm space-y-2 py-1">
						{visibleItems.map((item, index) => (
							<div key={index} className="border border-blue-200 rounded-md px-3 py-2 bg-blue-50 space-y-1">
								<div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
									Hewan Qurban {index + 1}
								</div>
								<div><span className="font-medium">Hewan</span>: {item.hewan || '-'}</div>
								<div><span className="font-medium">Qty</span>: {item.qty || '-'}</div>
								<div><span className="font-medium">Atas Nama</span>: {Array.isArray(item.atasNamaList) && item.atasNamaList.length > 0 ? item.atasNamaList.join(', ') : item.atasNama || '-'}</div>
							</div>
						))}
						{hasMore && (
							<div className="text-muted-foreground italic text-xs text-center pt-1">
								+{items.length - 3} item lainnya... (lihat detail)
							</div>
						)}
					</div>
				);
			},
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
						<div className="font-semibold w-[30%]">Email</div>
						<div>: {selectedItem?.email}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Nomor HP</div>
						<div>: {selectedItem?.hp}</div>
					</div>
					<div className="flex flex-row">
						<div className="font-semibold w-[30%]">Qurban Items</div>
						<div>
							: {selectedItem?.qurban_items?.length ? (
								<div className="space-y-2">
									{selectedItem.qurban_items.map((item, index) => (
										<div key={`${item.hewan}-${item.atasNama}-${index}`}>
											<div>{item.hewan} - Qty {item.qty}</div>
											<div>Atas Nama: {item.atasNama}</div>
											<div>
												List: {Array.isArray(item.atasNamaList) ? item.atasNamaList.join(', ') : '-'}
											</div>
										</div>
									))}
								</div>
							) : (
								<span>-</span>
							)}
						</div>
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
							setPage(1);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							setSearch(searchQuery);
							setPage(1);
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
				pageIndex={page - 1}
				pageSize={PAGE_SIZE}
				totalItems={totalItems}
				onPageChange={(nextPageIndex) => setPage(nextPageIndex + 1)}
			/>
		</div>
	);
}
