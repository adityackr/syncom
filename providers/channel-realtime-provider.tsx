import {
	ChannelEvent,
	ChannelEventSchema,
	RealtimeMessage,
} from '@/app/schemas/realtime.schema';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import usePartySocket from 'partysocket/react';
import { createContext, ReactNode, useContext } from 'react';

type ChannelRealtimeContextType = {
	send: (event: ChannelEvent) => void;
};

type ChannelRealtimeProviderProps = {
	children: ReactNode;
	channelId: string;
};

type MessageListPage = {
	items: RealtimeMessage[];
	nextCursor?: string;
};

type InfiniteMessages = InfiniteData<MessageListPage>;

const ChannelRealtimeContext = createContext<ChannelRealtimeContextType | null>(
	null
);

export const ChannelRealtimeProvider = ({
	children,
	channelId,
}: ChannelRealtimeProviderProps) => {
	const queryClient = useQueryClient();

	const socket = usePartySocket({
		host: 'http://localhost:8787',
		room: `channel-${channelId}`,
		party: 'chat',
		onMessage(e) {
			try {
				const parsed = JSON.parse(e.data);

				const result = ChannelEventSchema.safeParse(parsed);

				if (!result.success) {
					console.warn('Invalid event');
					return;
				}

				const event = result.data;

				if (event?.type === 'message:created') {
					const raw = event.payload.message;

					queryClient.setQueryData<InfiniteMessages>(
						['message.list', channelId],
						(oldData) => {
							if (!oldData) {
								return {
									pageParams: [undefined],
									pages: [
										{
											items: [raw],
											nextCursor: undefined,
										},
									],
								} as InfiniteMessages;
							}

							const first = oldData.pages[0];

							const updatedFirst: MessageListPage = {
								...first,
								items: [raw, ...first.items],
							};

							return {
								...oldData,
								pages: [updatedFirst, ...oldData.pages.slice(1)],
							};
						}
					);

					return;
				}

				if (event.type === 'message:updated') {
					const updated = event.payload.message;

					queryClient.setQueryData<InfiniteMessages>(
						['message.list', channelId],
						(oldData) => {
							if (!oldData) return oldData;

							const pages = oldData.pages.map((page) => ({
								...page,
								items: page.items.map((item) =>
									item.id === updated.id ? { ...item, ...updated } : item
								),
							}));

							return {
								...oldData,
								pages,
							};
						}
					);

					return;
				}

				if (event.type === 'reaction:updated') {
					const { messageId, reactions } = event.payload;

					queryClient.setQueryData<InfiniteMessages>(
						['message.list', channelId],
						(oldData) => {
							if (!oldData) return oldData;

							const pages = oldData.pages.map((page) => ({
								...page,
								items: page.items.map((item) =>
									item.id === messageId ? { ...item, reactions } : item
								),
							}));

							return {
								...oldData,
								pages,
							};
						}
					);

					return;
				}

				if (event.type === 'message:replies:increment') {
					const { messageId, delta } = event.payload;

					queryClient.setQueryData<InfiniteMessages>(
						['message.list', channelId],
						(oldData) => {
							if (!oldData) return oldData;

							const pages = oldData.pages.map((page) => ({
								...page,
								items: page.items.map((item) =>
									item.id === messageId
										? {
												...item,
												replyCount: Math.max(
													0,
													Number(item.replyCount ?? 0) + Number(delta)
												),
										  }
										: item
								),
							}));

							return {
								...oldData,
								pages,
							};
						}
					);

					return;
				}
			} catch (error) {
				console.error(error);
			}
		},
	});

	const value: ChannelRealtimeContextType = {
		send: (event) => {
			socket.send(JSON.stringify(event));
		},
	};

	return (
		<ChannelRealtimeContext.Provider value={value}>
			{children}
		</ChannelRealtimeContext.Provider>
	);
};

export const useChannelRealtime = () => {
	const context = useContext(ChannelRealtimeContext);

	if (!context) {
		throw new Error(
			'useChannelRealtime must be used within a ChannelRealtimeProvider'
		);
	}

	return context;
};
