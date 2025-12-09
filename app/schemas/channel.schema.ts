import { z } from 'zod';

export const transformedChannelName = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
};

export const ChannelNameSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters long')
		.max(100, 'Name must be at most 100 characters long')
		.transform((name, ctx) => {
			const transformedName = transformedChannelName(name);
			if (transformedName.length < 2) {
				ctx.addIssue({
					code: 'custom',
					message: 'Name must be at least 2 characters long',
				});

				return z.NEVER;
			}
			return transformedName;
		}),
});

export type ChannelName = z.infer<typeof ChannelNameSchema>;
