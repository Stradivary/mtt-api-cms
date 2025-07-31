'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from '@/components/ui/dialog';

type PdfPreviewModalProps = {
	isOpen: boolean;
	onClose: () => void;
	fileUrl: string;
};

export function PdfPreview({ isOpen, onClose, fileUrl }: PdfPreviewModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="!max-w-none !w-[90vw] !h-[90vh] p-4 flex flex-col">
				<DialogHeader>
					<DialogTitle className="text-lg">Preview Proposal (PDF)</DialogTitle>
				</DialogHeader>

				<div className="flex-1 w-full overflow-hidden">
					<iframe
						src={fileUrl}
						className="w-full h-full rounded border"
						title="PDF Preview"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
