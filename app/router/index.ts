import { createChannel, getChannel, listChannels } from './channel';
import { inviteMember } from './member';
import { createMessage, listMessages } from './message';
import { createWorkspace, listWorkspaces } from './workspace';

export const router = {
	workspace: {
		list: listWorkspaces,
		create: createWorkspace,
		member: {
			invite: inviteMember,
		},
	},
	channel: {
		create: createChannel,
		list: listChannels,
		get: getChannel,
	},
	message: {
		create: createMessage,
		list: listMessages,
	},
};
