'use client';

import { type CreateMessage, CreateMessageSchema } from '@/app/schemas/message';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';
import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { MessageListItem } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import {
	InfiniteData,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MessageComposer } from '../message/message-composer';

type ThreadReplyFormProps = {
	threadId: string;
	user: KindeUser<Record<string, unknown>>;
};

export const ThreadReplyForm: FC<ThreadReplyFormProps> = ({
	threadId,
	user,
}) => {
	const { channelId } = useParams<{ channelId: string }>();
	const upload = useAttachmentUpload();
	const [editorKey, setEditorKey] = useState(0);
	const queryClient = useQueryClient();

	const form = useForm({
		resolver: zodResolver(CreateMessageSchema),
		defaultValues: {
			content: '',
			channelId,
			threadId,
		},
	});

	useEffect(() => {
		form.setValue('threadId', threadId);
	}, [threadId, form]);

	const createMessageMutation = useMutation(
		orpc.message.create.mutationOptions({
			onMutate: async (data) => {
				type MessagePage = {
					items: Array<MessageListItem>;
					nextCursor?: string;
				};

				type InfiniteMessages = InfiniteData<MessagePage>;

				const listOptions = orpc.message.thread.list.queryOptions({
					input: {
						messageId: threadId,
					},
				});

				await queryClient.cancelQueries({ queryKey: listOptions.queryKey });

				const previous = queryClient.getQueryData(listOptions.queryKey);

				const optimistic: Message = {
					id: `optimistic-${crypto.randomUUID()}`,
					content: data.content,
					createdAt: new Date(),
					updatedAt: new Date(),
					authorId: user.id,
					authorEmail: user.email!,
					authorName: user.given_name ?? 'John Doe',
					authorAvatar: getAvatar(user.picture, user.email!),
					channelId: data.channelId,
					threadId: data.threadId!,
					imageUrl: data.imageUrl ?? null,
				};

				queryClient.setQueryData(listOptions.queryKey, (prevData) => {
					if (!prevData) return prevData;
					return { ...prevData, messages: [...prevData.messages, optimistic] };
				});

				// Optimistically bump repliesCount in main message list for the parent message
				queryClient.setQueryData(
					['message.list', channelId],
					(prevData: InfiniteMessages) => {
						if (!prevData) return prevData;

						const pages = prevData.pages.map((page) => ({
							...page,
							items: page.items.map((message) =>
								message.id === threadId
									? {
											...message,
											repliesCount: message.repliesCount + 1,
									  }
									: message
							),
						}));

						return {
							...prevData,
							pages,
						};
					}
				);

				return {
					listOptions,
					previous,
				};
			},
			onSuccess: (_data, _vars, context) => {
				queryClient.invalidateQueries({
					queryKey: context.listOptions.queryKey,
				});

				form.reset({ channelId, content: '', threadId });
				upload.clear();
				setEditorKey((prev) => prev + 1);
				return toast.success('Message created successfully');
			},
			onError: (_error, _vars, context) => {
				if (!context) return;

				const { listOptions, previous } = context;

				if (previous) {
					queryClient.setQueryData(listOptions.queryKey, previous);
				}

				return toast.error('Failed to create message');
			},
		})
	);

	const onSubmit = (data: CreateMessage) => {
		createMessageMutation.mutate({
			...data,
			imageUrl: upload.stagedUrl ?? undefined,
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<MessageComposer
									value={field.value as string}
									onChange={field.onChange}
									onSubmit={() => onSubmit(form.getValues())}
									upload={upload}
									key={editorKey}
									isSubmitting={createMessageMutation.isPending}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};
