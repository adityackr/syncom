import z from 'zod';

export const InviteMemberSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 3 characters long')
		.max(50, 'Name must be at most 50 characters long'),
	email: z.email(),
});

export type InviteMemberType = z.infer<typeof InviteMemberSchema>;
