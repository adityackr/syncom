import z from 'zod';

export const CreateMessageSchema = z.object({
	channelId: z.string(),
	content: z.string(),
	imageUrl: z.url().optional(),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;
