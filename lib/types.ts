import { GroupedReaction } from '@/app/schemas/message.schema';
import { Message } from './generated/prisma/client';

export type MessageListItem = Message & {
	replyCount: number;
	reactions: GroupedReaction[];
};
