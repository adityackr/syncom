import { GroupedReaction } from '@/app/schemas/message.schema';
import { Button } from '@/components/ui/button';
import { orpc } from '@/lib/orpc';
import { MessageListItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useChannelRealtime } from '@/providers/channel-realtime-provider';
import {
	InfiniteData,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FC } from 'react';
import { toast } from 'sonner';
import { EmojiReaction } from './emoji-reaction';

type ThreadContext = {
	type: 'thread';
	threadId: string;
};

type ListContext = {
	type: 'list';
	channelId: string;
};

type ReactionsBarProps = {
	messageId: string;
	reactions: GroupedReaction[];
	context?: ThreadContext | ListContext;
};

type MessagePage = {
	items: MessageListItem[];
	nextCursor?: string;
};

type InfiniteReplies = InfiniteData<MessagePage>;

export const ReactionsBar: FC<ReactionsBarProps> = ({
	messageId,
	reactions,
	context,
}) => {
	const { channelId } = useParams<{ channelId: string }>();
	const queryClient = useQueryClient();
	const { send } = useChannelRealtime();

	const toggleMutation = useMutation(
		orpc.message.reaction.toggle.mutationOptions({
			onMutate: async (vars: { messageId: string; emoji: string }) => {
				const bump = (reactions: GroupedReaction[]) => {
					const found = reactions.find((r) => r.emoji === vars.emoji);

					if (found) {
						const dec = found.count - 1;
						if (dec <= 0) {
							return reactions.filter((r) => r.emoji !== found.emoji);
						} else {
							return reactions.map((r) =>
								r.emoji === found.emoji
									? { ...r, count: dec, reactedByMe: false }
									: r
							);
						}
					}
					return [
						...reactions,
						{ emoji: vars.emoji, count: 1, reactedByMe: true },
					];
				};

				const isThread = context && context.type === 'thread';

				if (isThread) {
					const listOptions = orpc.message.thread.list.queryOptions({
						input: {
							messageId: context.threadId,
						},
					});

					await queryClient.cancelQueries({ queryKey: listOptions.queryKey });

					const previous = queryClient.getQueryData(listOptions.queryKey);

					queryClient.setQueryData(listOptions.queryKey, (oldData) => {
						if (!oldData) return oldData;

						if (vars.messageId === context.threadId) {
							return {
								...oldData,
								parent: {
									...oldData.parent,
									reactions: bump(oldData.parent.reactions),
								},
							};
						}

						return {
							...oldData,
							messages: oldData.messages.map((message) => {
								if (message.id !== vars.messageId) return message;

								const current = message.reactions;

								return {
									...message,
									reactions: bump(current),
								};
							}),
						};
					});

					return {
						previous,
						threadQueryKey: listOptions.queryKey,
					};
				}

				const listKey = ['message.list', channelId];
				await queryClient.cancelQueries({ queryKey: listKey });

				const previous = queryClient.getQueryData(listKey);

				queryClient.setQueryData<InfiniteReplies>(listKey, (oldData) => {
					if (!oldData) return oldData;

					const pages = oldData.pages.map((page) => ({
						...page,
						items: page.items.map((item) => {
							if (item.id !== messageId) return item;

							const current = item.reactions;

							return {
								...item,
								reactions: bump(current),
							};
						}),
					}));

					return {
						...oldData,
						pages,
					};
				});

				return {
					previous,
					listKey,
				};
			},
			onSuccess: (data) => {
				send({
					type: 'reaction:updated',
					payload: data,
				});
			},
			onError: (_err, _vars, ctx) => {
				if (ctx?.threadQueryKey && ctx.previous) {
					queryClient.setQueryData(ctx.threadQueryKey, ctx.previous);
				}

				if (ctx?.previous && ctx.listKey) {
					queryClient.setQueryData(ctx.listKey, ctx.previous);
				}
				return toast.error('Failed to toggle reaction');
			},
		})
	);

	const handleToggle = (emoji: string) => {
		toggleMutation.mutate({
			emoji,
			messageId,
		});
	};

	return (
		<div className="mt-1 flex items-center gap-1">
			{reactions?.map((reaction) => (
				<Button
					key={reaction.emoji}
					type="button"
					variant={'secondary'}
					size="sm"
					className={cn(
						'h-6 px-2 text-xs',
						reaction.reactedByMe && 'bg-primary/10 border-primary border'
					)}
					onClick={() => handleToggle(reaction.emoji)}
				>
					<span>{reaction.emoji}</span>
					<span>{reaction.count}</span>
				</Button>
			))}

			<EmojiReaction onSelect={handleToggle} />
		</div>
	);
};
