import { KindeOrganization, KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Organizations, init } from '@kinde/management-api-js';
import { z } from 'zod';
import { heavyWriteSecurityMiddleware } from '../middlewares/arcjet/heavy-write.middleware';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard.middleware';
import { requiredAuthMiddleware } from '../middlewares/auth.middleware';
import { base } from '../middlewares/base.middleware';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace.middleware';
import { workspaceSchema } from '../schemas/workspace.schema';

export const listWorkspaces = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.route({
		method: 'GET',
		path: '/workspace',
		summary: 'List all workspaces',
		tags: ['workspace'],
	})
	.input(z.void())
	.output(
		z.object({
			workspaces: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					avatar: z.string(),
				})
			),
			user: z.custom<KindeUser<Record<string, unknown>>>(),
			currentWorkspace: z.custom<KindeOrganization<unknown>>(),
		})
	)
	.handler(async ({ context, errors }) => {
		const { getUserOrganizations } = getKindeServerSession();

		const organizations = await getUserOrganizations();

		if (!organizations) {
			throw errors.NOT_FOUND();
		}

		return {
			workspaces: organizations?.orgs.map((org) => ({
				id: org.code,
				name: org.name ?? 'My Workspace',
				avatar: org.name?.charAt(0).toUpperCase() ?? 'M',
			})),
			user: context.user,
			currentWorkspace: context.workspace,
		};
	});

export const createWorkspace = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(heavyWriteSecurityMiddleware)
	.route({
		method: 'POST',
		path: '/workspace',
		summary: 'Create a new workspace',
		tags: ['workspace'],
	})
	.input(workspaceSchema)
	.output(
		z.object({
			orgCode: z.string(),
			workspaceName: z.string(),
		})
	)
	.handler(async ({ context, errors, input }) => {
		init();

		let data;

		try {
			data = await Organizations.createOrganization({
				requestBody: {
					name: input.name,
				},
			});
		} catch {
			throw errors.INTERNAL_SERVER_ERROR();
		}

		if (!data.organization?.code) {
			throw errors.FORBIDDEN({
				message: 'Organization not found',
			});
		}

		try {
			await Organizations.addOrganizationUsers({
				orgCode: data.organization.code,
				requestBody: {
					users: [
						{
							id: context.user.id,
							roles: ['admin'],
						},
					],
				},
			});
		} catch {
			throw errors.INTERNAL_SERVER_ERROR();
		}

		const { refreshTokens } = getKindeServerSession();

		await refreshTokens();

		return {
			orgCode: data.organization?.code,
			workspaceName: input.name,
		};
	});
