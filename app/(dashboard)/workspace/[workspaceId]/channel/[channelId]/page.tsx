'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { orpc } from '@/lib/orpc';
import { ThreadProvider, useThreadContext } from '@/providers/thread-provider';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ChannelHeader } from './_components/channel-header';
import { MessageList } from './_components/message-list';
import { MessageInputForm } from './_components/message/message-input-form';
import { ThreadSidebar } from './_components/thread/thread-sidebar';

const ChannelPage = () => {
	const { channelId } = useParams<{ channelId: string }>();
	const { data, error, isLoading } = useQuery(
		orpc.channel.get.queryOptions({ input: { channelId } })
	);
	const { isThreadOpen } = useThreadContext();

	if (error) {
		return <div>Something went wrong</div>;
	}

	return (
		<div className="flex h-screen w-full">
			{/* Main Channel Area */}
			<div className="flex flex-col flex-1 min-w-0">
				{/* Fixed Header */}
				{isLoading ? (
					<div className="flex items-center justify-between h-14 px-4 border-b">
						<Skeleton className="h-6 w-40" />
						<div className="flex items-center space-x-3">
							<Skeleton className="h-8 w-28" />
							<Skeleton className="h-8 w-20" />
							<Skeleton className="size-8" />
						</div>
					</div>
				) : (
					<ChannelHeader channelName={data?.channelName} />
				)}

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

			{/* Thread Sidebar */}
			{isThreadOpen && (
				<ThreadSidebar
					user={data?.currentUser as KindeUser<Record<string, unknown>>}
				/>
			)}
		</div>
	);
};

const ChannelPageWrapper = () => {
	return (
		<ThreadProvider>
			<ChannelPage />
		</ThreadProvider>
	);
};

export default ChannelPageWrapper;
