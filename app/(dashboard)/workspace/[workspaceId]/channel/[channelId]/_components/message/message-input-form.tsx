'use client';

import { CreateMessageSchema, type CreateMessage } from '@/app/schemas/message';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';
import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import {
	InfiniteData,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MessageComposer } from './message-composer';

type MessageInputFormProps = {
	channelId: string;
	user: KindeUser<Record<string, unknown>>;
};

type MessagePage = {
	items: Message[];
	nextCursor?: string;
};

type InfiniteMessages = InfiniteData<MessagePage>;

export const MessageInputForm: FC<MessageInputFormProps> = ({
	channelId,
	user,
}) => {
	const queryClient = useQueryClient();
	const [editorKey, setEditorKey] = useState(0);

	const upload = useAttachmentUpload();

	const form = useForm<CreateMessage>({
		resolver: zodResolver(CreateMessageSchema),
		defaultValues: {
			channelId,
			content: '',
		},
	});

	const createMessageMutation = useMutation(
		orpc.message.create.mutationOptions({
			onMutate: async (data) => {
				await queryClient.cancelQueries({
					queryKey: ['message.list', channelId],
				});

				const previousData = queryClient.getQueryData<InfiniteMessages>([
					'message.list',
					channelId,
				]);

				const tempId = `optimistic-${crypto.randomUUID()}`;

				const optimisticMessage: Message = {
					id: tempId,
					content: data.content,
					imageUrl: data.imageUrl ?? null,
					createdAt: new Date(),
					updatedAt: new Date(),
					authorId: user.id,
					authorEmail: user.email!,
					authorName: user.given_name ?? 'John Doe',
					authorAvatar: getAvatar(user.picture, user.email!),
					channelId,
				};

				queryClient.setQueryData(
					['message.list', channelId],
					(prevData: InfiniteMessages) => {
						if (!prevData) {
							return {
								pages: [
									{
										items: [optimisticMessage],
										nextCursor: undefined,
									},
								],
								pageParams: [],
							} satisfies InfiniteMessages;
						}

						const firstPage = prevData.pages[0] ?? {
							items: [],
							nextCursor: undefined,
						};

						const updatedFirstPage = {
							...firstPage,
							items: [optimisticMessage, ...firstPage.items],
						};

						return {
							...prevData,
							pages: [updatedFirstPage, ...prevData.pages.slice(1)],
						};
					}
				);

				return {
					previousData,
					tempId,
				};
			},
			onSuccess: (data, _variable, context) => {
				queryClient.setQueryData<InfiniteMessages>(
					['message.list', channelId],
					(prevData) => {
						if (!prevData) return prevData;

						const updatedPages = prevData.pages.map((page) => ({
							...page,
							items: page.items.map((item) =>
								item.id === context?.tempId ? { ...data } : item
							),
						}));

						return {
							...prevData,
							pages: updatedPages,
						};
					}
				);

				form.reset({ channelId, content: '' });
				upload.clear();
				setEditorKey((prev) => prev + 1);
			},
			onError: (_error, _variables, context) => {
				if (context?.previousData) {
					queryClient.setQueryData(
						['message.list', channelId],
						context.previousData
					);
				}

				return toast.error('Failed to send message');
			},
		})
	);

	const handleSubmit = (data: CreateMessage) => {
		createMessageMutation.mutate({
			...data,
			imageUrl: upload.stagedUrl ?? undefined,
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<MessageComposer
									key={editorKey}
									onSubmit={() => handleSubmit(form.getValues())}
									value={field.value || ''}
									onChange={field.onChange}
									isSubmitting={createMessageMutation.isPending}
									upload={upload}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};
