import z from 'zod';
import { GroupedReactionSchema } from './message.schema';

export const UserSchema = z.object({
	id: z.string(),
	full_name: z.string().nullable(),
	email: z.email().nullable(),
	picture: z.string().nullable(),
});

export const PresenceMessageSchema = z.union([
	z.object({
		type: z.literal('add-user'),
		payload: UserSchema,
	}),
	z.object({
		type: z.literal('remove-user'),
		payload: z.object({ id: z.string() }),
	}),
	z.object({
		type: z.literal('presence'),
		payload: z.object({ users: z.array(UserSchema) }),
	}),
]);

// minimal message shape for realtime events
export const RealtimeMessageSchema = z.object({
	id: z.string(),
	content: z.string().optional().nullable(),
	imageUrl: z.url().optional().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	authorId: z.string(),
	authorEmail: z.email().optional().nullable(),
	authorName: z.string().optional().nullable(),
	authorAvatar: z.string().optional().nullable(),
	channelId: z.string().nullable(),
	threadId: z.string().optional().nullable(),
	reactions: z.array(GroupedReactionSchema).optional(),
	replyCount: z.number().optional(),
});

// Channel level events
export const ChannelEventSchema = z.union([
	z.object({
		type: z.literal('message:created'),
		payload: z.object({ message: RealtimeMessageSchema }),
	}),
	z.object({
		type: z.literal('message:updated'),
		payload: z.object({ message: RealtimeMessageSchema }),
	}),
	z.object({
		type: z.literal('reaction:updated'),
		payload: z.object({
			messageId: z.string(),
			reactions: z.array(GroupedReactionSchema),
		}),
	}),
	z.object({
		type: z.literal('message:replies:increment'),
		payload: z.object({ messageId: z.string(), delta: z.number() }),
	}),
]);

// Thread level events
export const ThreadEventSchema = z.union([
	z.object({
		type: z.literal('thread:reply:created'),
		payload: z.object({ reply: RealtimeMessageSchema }),
	}),
	z.object({
		type: z.literal('thread:reaction:updated'),
		payload: z.object({
			messageId: z.string(),
			reactions: z.array(GroupedReactionSchema),
			threadId: z.string(),
		}),
	}),
]);

export type User = z.infer<typeof UserSchema>;
export type PresenceMessage = z.infer<typeof PresenceMessageSchema>;
export type ChannelEvent = z.infer<typeof ChannelEventSchema>;
export type ThreadEvent = z.infer<typeof ThreadEventSchema>;
export type RealtimeMessage = z.infer<typeof RealtimeMessageSchema>;
