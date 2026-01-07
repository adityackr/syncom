import prisma from '@/lib/db';
import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import type { MessageListItem } from '@/lib/types';
import z from 'zod';
import { readSecurityMiddleware } from '../middlewares/arcjet/read.middleware';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard.middleware';
import { writeSecurityMiddleware } from '../middlewares/arcjet/write.middleware';
import { requiredAuthMiddleware } from '../middlewares/auth.middleware';
import { base } from '../middlewares/base.middleware';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace.middleware';
import {
	CreateMessageSchema,
	GroupedReaction,
	GroupedReactionSchema,
	ToggleReactionSchema,
	UpdateMessageSchema,
} from '../schemas/message.schema';

/**
 * Groups reactions by emoji and counts the number of reactions for each emoji.
 * Also marks if the user has reacted to the message.
 * @param reactions - The reactions to group.
 * @param userId - The ID of the user.
 * @returns An array of objects containing the emoji, count, and reactedByMe properties.
 */
const groupReactions = (
	reactions: { emoji: string; userId: string }[],
	userId: string
): GroupedReaction[] => {
	const reactionMap = new Map<
		string,
		{ count: number; reactedByMe: boolean }
	>();

	for (const reaction of reactions) {
		const existing = reactionMap.get(reaction.emoji);

		if (existing) {
			existing.count++;
			if (reaction.userId === userId) {
				existing.reactedByMe = true;
			}
		} else {
			reactionMap.set(reaction.emoji, {
				count: 1,
				reactedByMe: reaction.userId === userId,
			});
		}
	}

	return Array.from(reactionMap.entries()).map(
		([emoji, { count, reactedByMe }]) => ({
			emoji,
			count,
			reactedByMe,
		})
	);
};

/**
 * Creates a new message.
 * @param input - The input for creating a message.
 * @param context - The context for the request.
 * @param errors - The errors for the request.
 * @returns The created message.
 */

export const createMessage = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(writeSecurityMiddleware)
	.route({
		method: 'POST',
		path: '/messages',
		summary: 'Create a new message',
		tags: ['Messages'],
	})
	.input(CreateMessageSchema)
	.output(z.custom<Message>())
	.handler(async ({ input, context, errors }) => {
		// verify the channel belongs to the user's organization
		const channel = await prisma.channel.findFirst({
			where: {
				id: input.channelId,
				workspaceId: context.workspace.orgCode,
			},
		});

		if (!channel) {
			throw errors.FORBIDDEN();
		}

		// If this is a thread reply, validate the parent message
		if (input.threadId) {
			const parent = await prisma.message.findFirst({
				where: {
					id: input.threadId,
					channel: {
						workspaceId: context.workspace.orgCode,
					},
				},
			});

			if (
				!parent ||
				parent.channelId !== input.channelId ||
				parent.threadId !== null
			) {
				throw errors.BAD_REQUEST();
			}
		}

		const created = await prisma.message.create({
			data: {
				content: input.content,
				channelId: input.channelId,
				authorId: context.user.id,
				authorEmail: context.user.email!,
				authorName: context.user.given_name ?? 'John Doe',
				authorAvatar: getAvatar(context.user.picture, context.user.email!),
				imageUrl: input.imageUrl,
				threadId: input.threadId,
			},
		});

		return { ...created };
	});

/**
 * Lists messages for a channel.
 * @param input - The input for listing messages.
 * @param context - The context for the request.
 * @param errors - The errors for the request.
 * @returns The list of messages.
 */

export const listMessages = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(readSecurityMiddleware)
	.route({
		method: 'GET',
		path: '/messages',
		summary: 'List messages',
		tags: ['Messages'],
	})
	.input(
		z.object({
			channelId: z.string(),
			limit: z.number().min(1).max(100).optional(),
			cursor: z.string().optional(),
		})
	)
	.output(
		z.object({
			items: z.array(z.custom<MessageListItem>()),
			nextCursor: z.string().optional(),
		})
	)
	.handler(async ({ input, context, errors }) => {
		// verify the channel belongs to the user's organization
		const channel = await prisma.channel.findFirst({
			where: {
				id: input.channelId,
				workspaceId: context.workspace.orgCode,
			},
		});

		if (!channel) {
			throw errors.FORBIDDEN();
		}

		const limit = input.limit ?? 30;

		const messages = await prisma.message.findMany({
			where: {
				channelId: input.channelId,
				threadId: null,
			},
			...(input.cursor
				? {
						cursor: {
							id: input.cursor,
						},
						skip: 1,
				  }
				: {}),
			take: limit,
			orderBy: [
				{
					createdAt: 'desc',
				},
				{
					id: 'desc',
				},
			],
			include: {
				_count: {
					select: {
						replies: true,
					},
				},
				MessageReaction: {
					select: {
						emoji: true,
						userId: true,
					},
				},
			},
		});

		const items: MessageListItem[] = messages.map((message) => ({
			id: message.id,
			content: message.content,
			createdAt: message.createdAt,
			updatedAt: message.updatedAt,
			threadId: message.threadId,
			channelId: message.channelId,
			authorId: message.authorId,
			authorEmail: message.authorEmail,
			authorName: message.authorName,
			authorAvatar: message.authorAvatar,
			imageUrl: message.imageUrl,
			replyCount: message._count.replies,
			reactions: groupReactions(
				message.MessageReaction.map((r) => ({
					emoji: r.emoji,
					userId: r.userId,
				})),
				context.user.id
			),
		}));

		const nextCursor =
			messages.length === limit ? messages[messages.length - 1].id : undefined;

		return {
			items,
			nextCursor,
		};
	});

/**
 * Updates a message.
 * @param input - The input for updating a message.
 * @param context - The context for the request.
 * @param errors - The errors for the request.
 * @returns The updated message.
 */

export const updateMessage = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(writeSecurityMiddleware)
	.route({
		method: 'PUT',
		path: '/messages/:messageId',
		summary: 'Update a message',
		tags: ['Messages'],
	})
	.input(UpdateMessageSchema)
	.output(
		z.object({
			message: z.custom<Message>(),
			canEdit: z.boolean(),
		})
	)
	.handler(async ({ input, context, errors }) => {
		// verify the message belongs to the user's organization
		const message = await prisma.message.findFirst({
			where: {
				id: input.messageId,
				channel: {
					workspaceId: context.workspace.orgCode,
				},
			},
			select: {
				id: true,
				authorId: true,
			},
		});

		if (!message) {
			throw errors.NOT_FOUND();
		}

		if (message.authorId !== context.user.id) {
			throw errors.FORBIDDEN();
		}

		const updated = await prisma.message.update({
			where: {
				id: input.messageId,
			},
			data: {
				content: input.content,
			},
		});

		return { message: updated, canEdit: updated.authorId === context.user.id };
	});

/**
 * Lists messages in a thread.
 * @param input - The input for listing messages in a thread.
 * @param context - The context for the request.
 * @param errors - The errors for the request.
 * @returns The list of messages in the thread.
 */

export const listThreadMessages = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(readSecurityMiddleware)
	.route({
		method: 'GET',
		path: '/messages/:messageId/thread',
		summary: 'List messages in a thread',
		tags: ['Messages'],
	})
	.input(
		z.object({
			messageId: z.string(),
		})
	)
	.output(
		z.object({
			parent: z.custom<MessageListItem>(),
			messages: z.array(z.custom<MessageListItem>()),
		})
	)
	.handler(async ({ input, context, errors }) => {
		const parentRow = await prisma.message.findFirst({
			where: {
				id: input.messageId,
				channel: {
					workspaceId: context.workspace.orgCode,
				},
			},
			include: {
				_count: {
					select: {
						replies: true,
					},
				},
				MessageReaction: {
					select: {
						emoji: true,
						userId: true,
					},
				},
			},
		});

		if (!parentRow) {
			throw errors.NOT_FOUND();
		}

		// Fetch messages with replies
		const messagesQuery = await prisma.message.findMany({
			where: {
				threadId: input.messageId,
			},
			orderBy: [
				{
					createdAt: 'asc',
				},
				{
					id: 'asc',
				},
			],
			include: {
				_count: {
					select: {
						replies: true,
					},
				},
				MessageReaction: {
					select: {
						emoji: true,
						userId: true,
					},
				},
			},
		});

		const parent: MessageListItem = {
			id: parentRow.id,
			content: parentRow.content,
			createdAt: parentRow.createdAt,
			updatedAt: parentRow.updatedAt,
			threadId: parentRow.threadId,
			channelId: parentRow.channelId,
			authorId: parentRow.authorId,
			authorEmail: parentRow.authorEmail,
			authorName: parentRow.authorName,
			authorAvatar: parentRow.authorAvatar,
			imageUrl: parentRow.imageUrl,
			replyCount: parentRow._count.replies,
			reactions: groupReactions(
				parentRow.MessageReaction.map((r) => ({
					emoji: r.emoji,
					userId: r.userId,
				})),
				context.user.id
			),
		};

		const messages: MessageListItem[] = messagesQuery.map((m) => ({
			id: m.id,
			content: m.content,
			createdAt: m.createdAt,
			updatedAt: m.updatedAt,
			threadId: m.threadId,
			channelId: m.channelId,
			authorId: m.authorId,
			authorEmail: m.authorEmail,
			authorName: m.authorName,
			authorAvatar: m.authorAvatar,
			imageUrl: m.imageUrl,
			replyCount: m._count.replies,
			reactions: groupReactions(
				m.MessageReaction.map((r) => ({
					emoji: r.emoji,
					userId: r.userId,
				})),
				context.user.id
			),
		}));

		return {
			parent,
			messages,
		};
	});

/**
 * Toggles a reaction on a message.
 * @param input - The input for toggling a reaction on a message.
 * @param context - The context for the request.
 * @param errors - The errors for the request.
 * @returns The reaction.
 */
export const toggleMessageReaction = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(writeSecurityMiddleware)
	.route({
		method: 'POST',
		path: '/messages/:messageId/reactions',
		summary: 'Toggle a message reaction',
		tags: ['Messages'],
	})
	.input(ToggleReactionSchema)
	.output(
		z.object({
			messageId: z.string(),
			reactions: z.array(GroupedReactionSchema),
		})
	)
	.handler(async ({ input, context, errors }) => {
		// verify the message belongs to the user's organization
		const message = await prisma.message.findFirst({
			where: {
				id: input.messageId,
				channel: {
					workspaceId: context.workspace.orgCode,
				},
			},
			select: {
				id: true,
			},
		});

		if (!message) {
			throw errors.NOT_FOUND();
		}

		// Check if the user has already reacted
		const inserted = await prisma.messageReaction.createMany({
			data: [
				{
					messageId: input.messageId,
					userId: context.user.id,
					emoji: input.emoji,
					userEmail: context.user.email!,
					userName: context.user.given_name ?? 'John Doe',
					userAvatar: getAvatar(context.user.picture, context.user.email!),
				},
			],
			skipDuplicates: true,
		});

		if (inserted.count === 0) {
			await prisma.messageReaction.deleteMany({
				where: {
					messageId: input.messageId,
					userId: context.user.id,
					emoji: input.emoji,
				},
			});
		}

		const updated = await prisma.message.findUnique({
			where: {
				id: input.messageId,
			},
			include: {
				MessageReaction: {
					select: {
						emoji: true,
						userId: true,
					},
				},
				_count: {
					select: {
						replies: true,
					},
				},
			},
		});

		if (!updated) {
			throw errors.NOT_FOUND();
		}

		return {
			messageId: updated.id,
			reactions: groupReactions(
				(updated.MessageReaction ?? []).map((r) => ({
					emoji: r.emoji,
					userId: r.userId,
				})),
				context.user.id
			),
		};
	});
