import { client } from '@/lib/orpc';
import { useChat } from '@ai-sdk/react';
import { eventIteratorToStream } from '@orpc/server';
import { Sparkles } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import {
	Message,
	MessageContent,
	MessageResponse,
} from '../ai-elements/message';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Skeleton } from '../ui/skeleton';

type ComposeAssistantProps = {
	content: string;
	onAccept?: (markdown: string) => void;
};

export const ComposeAssistant: FC<ComposeAssistantProps> = ({
	content,
	onAccept,
}) => {
	const [open, setOpen] = useState(false);
	const contentRef = useRef(content);

	useEffect(() => {
		contentRef.current = content;
	}, [content]);

	const {
		messages,
		status,
		error,
		sendMessage,
		setMessages,
		stop,
		clearError,
	} = useChat({
		id: `compose-assistant`,
		transport: {
			async sendMessages(options) {
				return eventIteratorToStream(
					await client.ai.compose.generate(
						{
							content: contentRef.current,
						},
						{ signal: options.abortSignal }
					)
				);
			},
			reconnectToStream() {
				throw new Error('Not implemented');
			},
		},
	});

	const lastAssistant = messages.findLast((m) => m.role === 'assistant');

	const composedText =
		lastAssistant?.parts
			.filter((p) => p.type === 'text')
			.map((p) => p.text)
			.join('\n\n') ?? '';

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);

		if (nextOpen) {
			const hasAssistantMessage = messages.some((m) => m.role === 'assistant');

			if (status !== 'ready' && hasAssistantMessage) {
				return;
			}

			sendMessage({ text: 'Rewrite' });
		} else {
			stop();
			clearError();
			setMessages([]);
		}
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size={'sm'}
					className="relative overflow-hidden rounded-full bg-linear-to-t from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
				>
					<span className="flex items-center gap-1.5">
						<Sparkles className="size-3.5" />
						<span className="text-xs font-medium">Compose</span>
					</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-100 p-0">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<div className="flex items-center gap-2">
						<span className="relative inline-flex items-center justify-center rounded-full bg-linear-to-r from-violet-600 to-fuchsia-600 py-1.5 px-4">
							<Sparkles className="size-3.5" />
							<span className="text-sm font-medium ml-1">
								Compose Assistant (Preview)
							</span>
						</span>
					</div>

					{status === 'streaming' && (
						<Button
							onClick={() => {
								stop();
							}}
							type="button"
							size="sm"
							variant="outline"
						>
							Stop
						</Button>
					)}
				</div>

				<div className="px-4 py-3 max-h-80 overflow-y-auto">
					{error ? (
						<div>
							<p className="text-red-500">{error.message}</p>
							<Button
								type="button"
								size="sm"
								onClick={() => {
									clearError();
									setMessages([]);
									sendMessage({ text: 'Summarize Thread' });
								}}
							>
								Try again
							</Button>
						</div>
					) : composedText ? (
						<Message from={'assistant'}>
							<MessageContent>
								<div className="[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
									<MessageResponse parseIncompleteMarkdown={status !== 'ready'}>
										{composedText}
									</MessageResponse>
								</div>
							</MessageContent>
						</Message>
					) : status === 'submitted' || status === 'streaming' ? (
						<div className="space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							Click Compose to generate
						</div>
					)}
				</div>

				<div className="flex items-center justify-end gap-3 border-t px-3 py-2 bg-muted/30">
					<Button
						type="submit"
						size="sm"
						variant="outline"
						onClick={() => {
							stop();
							clearError();
							setMessages([]);
							setOpen(false);
						}}
					>
						Decline
					</Button>
					<Button
						type="submit"
						size="sm"
						onClick={() => {
							if (!composedText) return;
							onAccept?.(composedText);
							stop();
							clearError();
							setMessages([]);
							setOpen(false);
						}}
						disabled={!composedText}
					>
						Accept
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};
