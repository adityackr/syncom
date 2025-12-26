import { getAvatar } from '@/lib/get-avatar';
import { init, Users } from '@kinde/management-api-js';
import z from 'zod';
import { heavyWriteSecurityMiddleware } from '../middlewares/arcjet/heavy-write.middleware';
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
