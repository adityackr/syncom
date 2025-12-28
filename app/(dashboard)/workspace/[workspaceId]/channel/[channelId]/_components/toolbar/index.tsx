import { Button } from '@/components/ui/button';
import { MessageSquareText, Pencil } from 'lucide-react';
import { FC } from 'react';

type MessageHoverToolbarProps = {
	messageId: string;
	canEdit: boolean;
	onEdit: () => void;
};

export const MessageHoverToolbar: FC<MessageHoverToolbarProps> = ({
	messageId,
	canEdit,
	onEdit,
}) => {
	return (
		<div className="absolute right-1 -top-3 items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 dark:border-neutral-800 dark:bg-neutral-900/90">
			{canEdit && (
				<Button variant="ghost" size="icon" onClick={onEdit}>
					<Pencil className="size-4" />
				</Button>
			)}

			<Button variant="ghost" size="icon">
				<MessageSquareText className="size-4" />
			</Button>
		</div>
	);
};
