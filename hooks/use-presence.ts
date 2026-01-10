import {
	PresenceMessage,
	PresenceMessageSchema,
	User,
} from '@/app/schemas/realtime.schema';
import { usePartySocket } from 'partysocket/react';
import { useState } from 'react';

type usePresenceProps = {
	room: string;
	currentUser: User | null;
};

export const usePresence = ({ room, currentUser }: usePresenceProps) => {
	const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

	const socket = usePartySocket({
		host: 'https://syncom-chat-realtime.acborty1991.workers.dev',
		room,
		party: 'chat',
		onOpen() {
			console.log('Connected to presence room: ', room);

			if (currentUser) {
				const message: PresenceMessage = {
					type: 'add-user',
					payload: currentUser,
				};

				socket.send(JSON.stringify(message));
			}
		},
		onMessage(event) {
			try {
				const message = JSON.parse(event.data);

				const result = PresenceMessageSchema.safeParse(message);

				if (result.success && result.data.type === 'presence') {
					setOnlineUsers(result.data.payload.users);
				}
			} catch (error) {
				console.log('Error parsing message: ', error);
			}
		},
		onClose() {
			console.log('Disconnected from presence room: ', room);
		},
		onError(error) {
			console.error('Websocket error: ', error);
		},
	});

	return {
		onlineUsers,
		socket,
	};
};
