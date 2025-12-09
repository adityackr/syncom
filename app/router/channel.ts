// export const createChannel = base
// 	.use(requiredAuthMiddleware)
// 	.use(requiredWorkspaceMiddleware)
// 	.use(standardSecurityMiddleware)
// 	.use(heavyWriteSecurityMiddleware)
// 	.route({
// 		method: 'POST',
// 		path: '/channels',
// 		summary: 'Create a new channel',
// 		tags: ['channels'],
// 	})
// 	.input(ChannelNameSchema)
// 	.output(z.custom<Channel>())
// 	.handler(async ({ input, context }) => {
// 		const channel = await prisma.channel.create({
// 			data: {
// 				name: input.name,
// 				workspaceId: context.workspace.orgCode,
// 				createdById: context.user.id,
// 			},
// 		});

// 		return channel;
// 	});
