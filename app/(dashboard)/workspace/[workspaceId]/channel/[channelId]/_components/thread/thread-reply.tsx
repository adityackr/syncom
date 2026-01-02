import { SafeContent } from '@/components/rich-text-editor/safe-content';
import { Message } from '@/lib/generated/prisma/client';
import Image from 'next/image';
import { FC } from 'react';

type ThreadReplyProps = {
	message: Message;
};

export const ThreadReply: FC<ThreadReplyProps> = ({ message }) => {
	return (
		<div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
			<Image
				src={message.authorAvatar}
				alt={message.authorName}
				width={32}
				height={32}
				className="rounded-full size-8 shrink-0"
			/>

			<div className="flex-1 space-y-1 min-w-0">
				<div className="flex items-center space-x-2">
					<span className="font-medium text-sm">{message.authorName}</span>
					<span className="text-xs text-muted-foreground">
						{new Intl.DateTimeFormat('en-US', {
							hour: 'numeric',
							minute: 'numeric',
							hour12: true,
							month: 'short',
							day: 'numeric',
						}).format(message.createdAt)}
					</span>
				</div>

				<SafeContent
					className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
					content={JSON.parse(message.content)}
				/>

				{message.imageUrl && (
					<div className="mt-2">
						<Image
							src={message.imageUrl}
							alt="Message Image"
							width={512}
							height={512}
							className="rounded-md max-h-[320px] w-auto object-contain"
						/>
					</div>
				)}
			</div>
		</div>
	);
};
