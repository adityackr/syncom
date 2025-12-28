import { UpdateMessage, UpdateMessageSchema } from '@/app/schemas/message';
import { RichTextEditor } from '@/components/rich-text-editor/editor';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Message } from '@/lib/generated/prisma/client';
import { orpc } from '@/lib/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	InfiniteData,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type EditMessageProps = {
	message: Message;
	onCancel: () => void;
	onSave: () => void;
};

export const EditMessage: FC<EditMessageProps> = ({
	message,
	onCancel,
	onSave,
}) => {
	const queryClient = useQueryClient();
	const form = useForm({
		resolver: zodResolver(UpdateMessageSchema),
		defaultValues: {
			messageId: message.id,
			content: message.content,
		},
	});

	const updateMutation = useMutation(
		orpc.message.update.mutationOptions({
			onSuccess: (updated) => {
				type MessagePage = {
					items: Message[];
					nextCursor: string | null;
				};

				type InfiniteMessages = InfiniteData<MessagePage>;

				queryClient.setQueryData<InfiniteMessages>(
					['message.list', message.channelId],
					(prev) => {
						if (!prev) return prev;
						const updatedMessage = updated.message;

						const pages = prev.pages.map((page) => {
							return {
								...page,
								items: page.items.map((item) =>
									item.id === updatedMessage.id
										? { ...item, ...updatedMessage }
										: item
								),
							};
						});

						return {
							...prev,
							pages,
						};
					}
				);
				toast.success('Message updated successfully');
				onSave();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		})
	);

	const onSubmit = (data: UpdateMessage) => {
		updateMutation.mutate(data);
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
								<RichTextEditor
									field={field}
									sendButton={
										<div className="flex items-center gap-2">
											<Button
												type="button"
												size="sm"
												variant={'outline'}
												onClick={onCancel}
												disabled={updateMutation.isPending}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												size="sm"
												disabled={updateMutation.isPending}
											>
												{updateMutation.isPending ? 'Updating...' : 'Update'}
											</Button>
										</div>
									}
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
