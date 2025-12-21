'use client';

import { orpc } from '@/lib/orpc';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ChannelHeader } from './_components/channel-header';
import { MessageList } from './_components/message-list';
import { MessageInputForm } from './_components/message/message-input-form';

const ChannelPage = () => {
	const { channelId } = useParams<{ channelId: string }>();
	const { data, error, isLoading } = useQuery(
		orpc.channel.get.queryOptions({ input: { channelId } })
	);

	if (error) {
		return <div>Something went wrong</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex h-screen w-full">
			{/* Main Channel Area */}
			<div className="flex flex-col flex-1 min-w-0">
				{/* Fixed Header */}
				<ChannelHeader channelName={data?.channelName} />

				{/* Scrollable Messages Area */}
				<div className="flex-1 overflow-hidden mb-4">
					<MessageList />
				</div>

				{/* Fixed Input Area */}
				<div className="border-t bg-background py-2 px-3">
					<MessageInputForm
						channelId={channelId}
						user={data?.currentUser as KindeUser<Record<string, unknown>>}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChannelPage;
