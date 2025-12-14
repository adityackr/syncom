'use client';

import { CreateMessageSchema, type CreateMessage } from '@/app/schemas/message';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { orpc } from '@/lib/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MessageComposer } from './message-composer';

type MessageInputFormProps = {
	channelId: string;
};

export const MessageInputForm: FC<MessageInputFormProps> = ({ channelId }) => {
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
				return toast.success('Message sent successfully');
			},
			onError: () => {
				return toast.error('Failed to send message');
			},
		})
	);

	const handleSubmit = (data: CreateMessage) => {
		createMessageMutation.mutate(data);
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
									value={field.value || ''}
									onChange={field.onChange}
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
