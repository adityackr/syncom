import z from 'zod';

export const CreateMessageSchema = z.object({
	channelId: z.string(),
	content: z.string(),
	imageUrl: z.url().optional(),
	threadId: z.string().optional(),
});

export const UpdateMessageSchema = z.object({
	messageId: z.string(),
	content: z.string(),
});

export const ToggleReactionSchema = z.object({
	messageId: z.string(),
	emoji: z.string(),
});

export const GroupedReactionSchema = z.object({
	emoji: z.string(),
	count: z.number(),
	reactedByMe: z.boolean(),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type UpdateMessage = z.infer<typeof UpdateMessageSchema>;
export type ToggleReaction = z.infer<typeof ToggleReactionSchema>;
export type GroupedReaction = z.infer<typeof GroupedReactionSchema>;
