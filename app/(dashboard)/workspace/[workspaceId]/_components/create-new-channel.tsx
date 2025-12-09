'use client';

import {
	ChannelName,
	ChannelNameSchema,
	transformedChannelName,
} from '@/app/schemas/channel.schema';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const CreateNewChannel = () => {
	const [open, setOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(ChannelNameSchema),
		defaultValues: {
			name: '',
		},
	});

	// const createChannelMutation = useMutation(
	// 	orpc.channel.create.mutationOptions({
	// 		onSuccess: (newChannel) => {
	// 			toast.success(`Channel ${newChannel.name} created successfully`);
	// 			form.reset();
	// 			setOpen(false);
	// 		},
	// 		onError: (error) => {
	// 			if (isDefinedError(error)) {
	// 				toast.error(error.message);
	// 				return;
	// 			}
	// 			toast.error('Failed to create channel. Please try again later.');
	// 		},
	// 	})
	// );

	// eslint-disable-next-line react-hooks/incompatible-library
	const watchedName = form.watch('name');
	const transformedName = watchedName
		? transformedChannelName(watchedName)
		: '';

	const onSubmit = (data: ChannelName) => {
		console.log(data);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full">
					<Plus className="size-4" />
					Add Channel
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Channel</DialogTitle>
					<DialogDescription>
						Add a new channel to your workspace to stay organized.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Channel Name</FormLabel>
									<FormControl>
										<Input placeholder="My Channel" {...field} />
									</FormControl>
									{transformedName && transformedName !== watchedName && (
										<p className="text-sm text-muted-foreground">
											Will be created as{' '}
											<code className="bg-muted px-1 py-0.5 rounded text-xs">
												{transformedName}
											</code>
										</p>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end">
							<Button type="submit">Create New Channel</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
