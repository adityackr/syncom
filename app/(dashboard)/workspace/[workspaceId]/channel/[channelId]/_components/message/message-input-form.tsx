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
import { orpc } from '@/lib/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MessageComposer } from './message-composer';

type MessageInputFormProps = {
	channelId: string;
};

export const MessageInputForm: FC<MessageInputFormProps> = ({ channelId }) => {
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
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.message.list.key(),
				});

				form.reset({ channelId, content: '' });
				upload.clear();
				setEditorKey((prev) => prev + 1);

				return toast.success('Message sent successfully');
			},
			onError: (error) => {
				console.error('Message creation error:', error);
				return toast.error(
					`Failed to send message: ${error.message || 'Unknown error'}`
				);
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
