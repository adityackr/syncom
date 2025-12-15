import { SafeContent } from '@/components/rich-text-editor/safe-content';
import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import Image from 'next/image';
import { FC } from 'react';

type MessageItemProps = {
	message: Message;
};

export const MessageItem: FC<MessageItemProps> = ({ message }) => {
	return (
		<div className="flex space-x-3 relative p-3 group hover:bg-muted/50">
			<Image
				src={getAvatar(message.authorAvatar, message.authorEmail)}
				alt={message.authorName}
				width={32}
				height={32}
				className="rounded-lg size-8"
			/>

			<div className="flex-1 space-y-1 min-w-0">
				<div className="flex items-center gap-x-2">
					<p className="font-medium leading-none">{message.authorName}</p>
					<p className="text-xs text-muted-foreground leading-none">
						{new Intl.DateTimeFormat('en-US', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						}).format(message.createdAt)}{' '}
						{new Intl.DateTimeFormat('en-US', {
							hour: '2-digit',
							minute: '2-digit',
						}).format(message.createdAt)}
					</p>
				</div>

				<SafeContent
					className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
					content={JSON.parse(message.content)}
				/>
			</div>
		</div>
	);
};
