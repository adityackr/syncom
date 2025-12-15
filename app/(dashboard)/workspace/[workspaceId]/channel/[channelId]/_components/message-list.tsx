'use client';

import { orpc } from '@/lib/orpc';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { MessageItem } from './message/message-item';

export const MessageList = () => {
	const { channelId } = useParams<{ channelId: string }>();
	const { data: messages } = useQuery(
		orpc.message.list.queryOptions({
			input: {
				channelId,
			},
		})
	);
	return (
		<div className="relative h-full">
			<div className="h-full overflow-y-auto">
				{messages?.map((message) => (
					<MessageItem key={message.id} message={message} />
				))}
			</div>
		</div>
	);
};
