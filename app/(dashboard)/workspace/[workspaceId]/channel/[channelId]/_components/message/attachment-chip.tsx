import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

type AttachmentChipProps = {
	url: string;
	onRemove: () => void;
};

export const AttachmentChip: FC<AttachmentChipProps> = ({ url, onRemove }) => {
	return (
		<div className="group relative overflow-hidden rounded-md bg-muted size-12">
			<Image src={url} alt="Attachment" fill className="object-cover" />

			<div className="absolute inset-0 grid place-items-center bg-black/0 transition-opacity opacity-0 group-hover:opacity-100 group-hover:bg-black/30">
				<Button
					variant="destructive"
					className="size-6 p-0 rounded-full"
					type="button"
					onClick={onRemove}
				>
					<X className="size-3" />
				</Button>
			</div>
		</div>
	);
};
