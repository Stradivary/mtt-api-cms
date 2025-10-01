'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ModalPreviewProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	children?: ReactNode;
	footerText?: string;
}

export function ModalPreview({
	open,
	onClose,
	title = "Detail Data",
	children,
	footerText = "Tutup",
}: ModalPreviewProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent
				className="!left-1/2 !translate-x-[calc(-50%+170px)] max-w-3xl"
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col max-h-[300px] overflow-y-auto">
					{children}
				</div>

				<DialogFooter>
					<div className="w-full flex justify-center pt-4">
						<Button variant="default" onClick={onClose} className="cursor-pointer w-full">
							{footerText}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
