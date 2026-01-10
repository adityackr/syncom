import {
	RealtimeMessage,
	ThreadEvent,
	ThreadEventSchema,
} from '@/app/schemas/realtime.schema';
import { orpc } from '@/lib/orpc';
import { useQueryClient } from '@tanstack/react-query';
import usePartySocket from 'partysocket/react';
import { createContext, FC, ReactNode, useContext } from 'react';

type ThreadRealtimeProviderProps = {
	children: ReactNode;
	threadId: string;
};

type ThreadListOptions = ReturnType<
	typeof orpc.message.thread.list.queryOptions
>;

type ThreadQueryData = Awaited<ReturnType<ThreadListOptions['queryFn']>>;

type ThreadRealtimeContextType = {
	send: (event: ThreadEvent) => void;
};

const ThreadRealtimeContext = createContext<ThreadRealtimeContextType | null>(
	null
);

export const ThreadRealtimeProvider: FC<ThreadRealtimeProviderProps> = ({
	children,
	threadId,
}) => {
	const queryClient = useQueryClient();

	const socket = usePartySocket({
		host: 'https://syncom-chat-realtime.acborty1991.workers.dev',
		room: `thread-${threadId}`,
		party: 'chat',
		onMessage(event) {
			try {
				const parsed = JSON.parse(event.data);

				const result = ThreadEventSchema.safeParse(parsed);

				if (!result.success) {
					console.warn('Invalid event');
					return;
				}

				const evt = result.data;

				if (evt.type === 'thread:reply:created') {
					const replyObj = evt.payload.reply as RealtimeMessage;

					const listOptions = orpc.message.thread.list.queryOptions({
						input: { messageId: threadId },
					});

					queryClient.setQueryData<ThreadQueryData>(
						listOptions.queryKey,
						(oldData) => {
							if (!oldData) return oldData;

							const reply = {
								reactions: Array.isArray(replyObj.reactions)
									? replyObj.reactions
									: [],
								...replyObj,
							} as ThreadQueryData['messages'][number];

							return {
								...oldData,
								messages: [...oldData.messages, reply],
							};
						}
					);

					return;
				}

				if (evt.type === 'thread:reaction:updated') {
					const { threadId: tid, reactions, messageId } = evt.payload;

					if (tid !== threadId) return;

					const listOptions = orpc.message.thread.list.queryOptions({
						input: { messageId: threadId },
					});

					queryClient.setQueryData<ThreadQueryData>(
						listOptions.queryKey,
						(oldData) => {
							if (!oldData) return oldData;

							if (messageId === threadId) {
								return {
									...oldData,
									parent: { ...oldData.parent, reactions },
								};
							}

							return {
								...oldData,
								messages: oldData.messages.map((message) =>
									message.id === messageId ? { ...message, reactions } : message
								),
							};
						}
					);

					return;
				}
			} catch {
				console.log('Failed to handle event');
			}
		},
	});

	const value: ThreadRealtimeContextType = {
		send: (event) => {
			socket.send(JSON.stringify(event));
		},
	};

	return (
		<ThreadRealtimeContext.Provider value={value}>
			{children}
		</ThreadRealtimeContext.Provider>
	);
};

export const useThreadRealtime = () => {
	const context = useContext(ThreadRealtimeContext);

	if (!context) {
		throw new Error(
			'useThreadRealtime must be used within a ThreadRealtimeProvider'
		);
	}

	return context;
};

export const useOptionalThreadRealtime =
	(): ThreadRealtimeContextType | null => {
		return useContext(ThreadRealtimeContext);
	};
