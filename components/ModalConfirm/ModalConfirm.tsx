'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalConfirmProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	loading?: boolean;
}

export function ModalConfirm({
	open,
	onClose,
	onConfirm,
	title = "Konfirmasi",
	description = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
	confirmText = "Ya",
	cancelText = "Batal",
	loading = false,
}: ModalConfirmProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent
				className="!left-1/2 !translate-x-[calc(-50%+170px)]"
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading} className="cursor-pointer">
						{cancelText}
					</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={loading} className="cursor-pointer">
						{loading ? "Memproses..." : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
