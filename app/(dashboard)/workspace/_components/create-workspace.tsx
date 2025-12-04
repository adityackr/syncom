'use client';

import { type Workspace, workspaceSchema } from '@/app/schemas/workspace';
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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const CreateWorkspace = () => {
	const [open, setOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(workspaceSchema),
		defaultValues: {
			name: '',
		},
	});

	const onSubmit = (data: Workspace) => {
		console.log('data', data);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							size={'icon'}
							variant={'ghost'}
							className="size-12 rounded-xl border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:rounded-lg transition-all duration-200"
						>
							<Plus className="size-5" />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>

				<TooltipContent side="right">
					<p className="text-xs font-medium">Create Workspace</p>
				</TooltipContent>
			</Tooltip>

			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Workspace</DialogTitle>
					<DialogDescription>
						Create a new workspace to start collaborating with your team.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="My Workspace" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<Button type="submit">Create Workspace</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
