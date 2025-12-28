import z from 'zod';

export const CreateMessageSchema = z.object({
	channelId: z.string(),
	content: z.string(),
	imageUrl: z.url().optional(),
});

export const UpdateMessageSchema = z.object({
	messageId: z.string(),
	content: z.string(),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type UpdateMessage = z.infer<typeof UpdateMessageSchema>;
