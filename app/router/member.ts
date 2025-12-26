import { getAvatar } from '@/lib/get-avatar';
import {
	init,
	organization_user,
	Organizations,
	Users,
} from '@kinde/management-api-js';
import z from 'zod';
import { heavyWriteSecurityMiddleware } from '../middlewares/arcjet/heavy-write.middleware';
import { readSecurityMiddleware } from '../middlewares/arcjet/read';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard.middleware';
import { requiredAuthMiddleware } from '../middlewares/auth.middleware';
import { base } from '../middlewares/base.middleware';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace.middleware';
import { InviteMemberSchema } from '../schemas/member.schema';

export const inviteMember = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(heavyWriteSecurityMiddleware)
	.route({
		method: 'POST',
		path: '/workspace/members/invite',
		summary: 'Invite a new member to the workspace',
		tags: ['Members'],
	})
	.input(InviteMemberSchema)
	.output(z.void())
	.handler(async ({ input, context, errors }) => {
		try {
			init();

			await Users.createUser({
				requestBody: {
					organization_code: context.workspace.orgCode,
					profile: {
						given_name: input.name,
						picture: getAvatar(null, input.email),
					},
					identities: [
						{
							type: 'email',
							details: {
								email: input.email,
							},
						},
					],
				},
			});
		} catch {
			throw errors.INTERNAL_SERVER_ERROR();
		}
	});

export const listMembers = base
	.use(requiredAuthMiddleware)
	.use(requiredWorkspaceMiddleware)
	.use(standardSecurityMiddleware)
	.use(readSecurityMiddleware)
	.route({
		method: 'GET',
		path: '/workspace/members',
		summary: 'List members of the workspace',
		tags: ['Members'],
	})
	.input(z.void())
	.output(z.array(z.custom<organization_user>()))
	.handler(async ({ context, errors }) => {
		try {
			init();
			const data = await Organizations.getOrganizationUsers({
				orgCode: context.workspace.orgCode,
				sort: 'name_asc',
			});

			if (!data.organization_users) {
				throw errors.NOT_FOUND();
			}

			return data.organization_users;
		} catch {
			throw errors.INTERNAL_SERVER_ERROR();
		}
	});
