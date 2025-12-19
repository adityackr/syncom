import { RichTextEditor } from '@/components/rich-text-editor/editor';
import { ImageUploadModal } from '@/components/rich-text-editor/image-upload-modal';
import { Button } from '@/components/ui/button';
import { type UseAttachmentUpload } from '@/hooks/use-attachment-upload';
import { ImageIcon, Send } from 'lucide-react';
import { FC } from 'react';
import { AttachmentChip } from './attachment-chip';

type MessageComposerProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isSubmitting?: boolean;
	upload: UseAttachmentUpload;
};

export const MessageComposer: FC<MessageComposerProps> = ({
	value,
	onChange,
	onSubmit,
	isSubmitting,
	upload,
}) => {
	return (
		<>
			<RichTextEditor
				field={{ value, onChange }}
				sendButton={
					<Button
						type="button"
						size="sm"
						onClick={onSubmit}
						disabled={isSubmitting}
					>
						<Send className="size-4 mr-1" />
						Send
					</Button>
				}
				footerLeft={
					upload.stagedUrl ? (
						<AttachmentChip url={upload.stagedUrl} onRemove={upload.clear} />
					) : (
						<Button
							onClick={() => upload.setIsOpen(true)}
							type="button"
							size="sm"
							variant="outline"
						>
							<ImageIcon />
							Attach
						</Button>
					)
				}
			/>

			<ImageUploadModal
				isOpen={upload.isOpen}
				onOpenChange={upload.setIsOpen}
				onUploaded={(url) => {
					upload.onUploaded(url);
				}}
			/>
		</>
	);
};
