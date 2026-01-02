import { SafeContent } from '@/components/rich-text-editor/safe-content';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import type { MessageListItem } from '@/lib/types';
import { useThreadContext } from '@/providers/thread-provider';
import { useQueryClient } from '@tanstack/react-query';
import { MessagesSquare } from 'lucide-react';
import Image from 'next/image';
import { FC, useCallback, useState } from 'react';
import { MessageHoverToolbar } from '../toolbar';
import { EditMessage } from '../toolbar/edit-message';

type MessageItemProps = {
	message: MessageListItem;
	currentUserId: string;
};

export const MessageItem: FC<MessageItemProps> = ({
	message,
	currentUserId,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const { openThread } = useThreadContext();
	const queryClient = useQueryClient();

	const prefetchThread = useCallback(() => {
		const options = orpc.message.thread.list.queryOptions({
			input: {
				messageId: message.id,
			},
		});
		queryClient
			.prefetchQuery({ ...options, staleTime: 60_000 })
			.catch(() => {});
	}, [message.id, queryClient]);

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

				{isEditing ? (
					<EditMessage
						message={message}
						onCancel={() => setIsEditing(false)}
						onSave={() => setIsEditing(false)}
					/>
				) : (
					<>
						<SafeContent
							className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
							content={JSON.parse(message.content)}
						/>

						{message.imageUrl && (
							<div className="mt-3">
								<Image
									src={message.imageUrl}
									alt="Attachment"
									width={512}
									height={512}
									className="rounded-md max-h-[320px] w-auto object-contain"
								/>
							</div>
						)}

						{message.repliesCount > 0 && (
							<button
								className="mt-1  inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border cursor-pointer"
								type="button"
								onClick={() => openThread(message.id)}
								onMouseEnter={prefetchThread}
								onFocus={prefetchThread}
							>
								<MessagesSquare className="size-3.5" />
								<span>
									{message.repliesCount}{' '}
									{message.repliesCount === 1 ? 'reply' : 'replies'}
								</span>
								<span className="opacity-0 group-hover:opacity-100 transition-opacity">
									View Thread
								</span>
							</button>
						)}
					</>
				)}
			</div>

			<MessageHoverToolbar
				messageId={message.id}
				canEdit={message.authorId === currentUserId}
				onEdit={() => setIsEditing(true)}
			/>
		</div>
	);
};
