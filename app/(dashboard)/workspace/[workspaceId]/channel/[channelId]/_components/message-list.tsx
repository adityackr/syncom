import { MessageItem } from './message/message-item';

const messages = [
	{
		id: 1,
		message: 'Hello. How are you?',
		date: new Date(),
		avatar: 'https://github.com/adityackr.png',
		userName: 'Aditya Chakraborty',
	},
];

export const MessageList = () => {
	return (
		<div className="relative h-full">
			<div className="h-full overflow-y-auto">
				{messages.map((message) => (
					<MessageItem key={message.id} {...message} />
				))}
			</div>
		</div>
	);
};
