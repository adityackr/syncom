import prisma from '@/lib/db';
import { Message } from '@/lib/generated/prisma/client';
import { getAvatar } from '@/lib/get-avatar';
import z from 'zod';
import { readSecurityMiddleware } from '../middlewares/arcjet/read';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard.middleware';
import { writeSecurityMiddleware } from '../middlewares/arcjet/write';
import { requiredAuthMiddleware } from '../middlewares/auth.middleware';
import { base } from '../middlewares/base.middleware';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace.middleware';
import { CreateMessageSchema } from '../schemas/message';

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

		const created = await prisma.message.create({
			data: {
				content: input.content,
				channelId: input.channelId,
				authorId: context.user.id,
				authorEmail: context.user.email!,
				authorName: context.user.given_name ?? 'John Doe',
				authorAvatar: getAvatar(context.user.picture, context.user.email!),
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
		})
	)
	.output(z.array(z.custom<Message>()))
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

		const messages = await prisma.message.findMany({
			where: {
				channelId: input.channelId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return messages;
	});
