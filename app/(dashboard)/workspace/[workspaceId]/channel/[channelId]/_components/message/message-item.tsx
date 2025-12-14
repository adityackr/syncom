import Image from 'next/image';
import { FC } from 'react';

type MessageItemProps = {
	id: number;
	message: string;
	date: Date;
	avatar: string;
	userName: string;
};

export const MessageItem: FC<MessageItemProps> = ({
	id,
	message,
	date,
	avatar,
	userName,
}) => {
	return (
		<div className="flex space-x-3 relative p-3 group hover:bg-muted/50">
			<Image
				src={avatar}
				alt={userName}
				width={32}
				height={32}
				className="rounded-lg size-8"
			/>

			<div className="flex-1 space-y-1 min-w-0">
				<div className="flex items-center gap-x-2">
					<p className="font-medium leading-none">{userName}</p>
					<p className="text-xs text-muted-foreground leading-none">
						{new Intl.DateTimeFormat('en-US', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						}).format(date)}{' '}
						{new Intl.DateTimeFormat('en-US', {
							hour: '2-digit',
							minute: '2-digit',
						}).format(date)}
					</p>
				</div>

				<p className="text-sm wrap-break-word max-w-none">{message}</p>
			</div>
		</div>
	);
};
