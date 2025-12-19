'use client';

import { UploadDropzone } from '@/lib/uploadthing';
import { FC } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

type ImageUploadModalProps = {
	isOpen: boolean;
	onOpenChange: (value: boolean) => void;
	onUploaded: (url: string) => void;
};

export const ImageUploadModal: FC<ImageUploadModalProps> = ({
	isOpen,
	onOpenChange,
	onUploaded,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload Image</DialogTitle>
				</DialogHeader>

				<UploadDropzone
					className="ut-uploading:opacity-90 ut-ready:bg-card ut-ready:border-border ut-ready:text-foreground ut-uploading:bg-muted ut-uploading:border-border ut-uploading:text-muted-foreground ut-label:text-sm ut-label:text-muted-foreground ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/50 rounded-lg border"
					appearance={{
						container: 'bg-card',
						label: 'text-muted-foreground',
						allowedContent: 'text-muted-foreground text-xs',
						button: 'bg-primary text-primary-foreground hover:bg-primary/50',
						uploadIcon: 'text-muted-foreground',
					}}
					endpoint="imageUploader"
					onClientUploadComplete={(res) => {
						const url = res[0].ufsUrl;

						toast.success('Image uploaded successfully');

						onUploaded(url);
					}}
					onUploadError={(error) => {
						toast.error(error.message);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
};
