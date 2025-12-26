import {
	InviteMemberSchema,
	type InviteMemberType,
} from '@/app/schemas/member.schema';
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
import { orpc } from '@/lib/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const InviteMember = () => {
	const [open, setOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(InviteMemberSchema),
		defaultValues: {
			email: '',
			name: '',
		},
	});

	const inviteMutation = useMutation(
		orpc.workspace.member.invite.mutationOptions({
			onSuccess: () => {
				toast.success('Member invited successfully!');
				form.reset();
				setOpen(false);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		})
	);

	const onSubmit = (data: InviteMemberType) => {
		inviteMutation.mutate(data);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserPlus />
					Invite Member
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Invite Member</DialogTitle>
					<DialogDescription>
						Invite a new member to your workspace by using their email
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter Name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="Enter email..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<Button type="submit">Send Invitation</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
