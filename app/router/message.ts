import prisma from '@/lib/db';
import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import type { MessageListItem } from '@/lib/types';
import z from 'zod';
import { readSecurityMiddleware } from '../middlewares/arcjet/read';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard.middleware';
import { writeSecurityMiddleware } from '../middlewares/arcjet/write';
import { requiredAuthMiddleware } from '../middlewares/auth.middleware';
import { base } from '../middlewares/base.middleware';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace.middleware';
import { CreateMessageSchema, UpdateMessageSchema } from '../schemas/message';

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
			repliesCount: message._count.replies,
		}));

		const nextCursor =
			messages.length === limit ? messages[messages.length - 1].id : undefined;

		return {
			items,
			nextCursor,
		};
	});

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
			parent: z.custom<Message>(),
			messages: z.array(z.custom<Message>()),
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
		});

		if (!parentRow) {
			throw errors.NOT_FOUND();
		}

		// Fetch all thread replies
		const replies = await prisma.message.findMany({
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
		});

		const parent = {
			...parentRow,
		};

		const messages = replies.map((reply) => {
			return {
				...reply,
			};
		});

		return {
			parent,
			messages,
		};
	});
