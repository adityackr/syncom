import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { client } from '@/lib/orpc';
import { useChat } from '@ai-sdk/react';
import { eventIteratorToStream } from '@orpc/client';
import { Sparkles } from 'lucide-react';
import { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type SummarizeThreadProps = {
	messageId: string;
};

export const SummarizeThread: FC<SummarizeThreadProps> = ({ messageId }) => {
	const [open, setOpen] = useState(false);
	const {
		messages,
		status,
		error,
		sendMessage,
		setMessages,
		stop,
		clearError,
	} = useChat({
		id: `thread-summary:${messageId}`,
		transport: {
			async sendMessages(options) {
				return eventIteratorToStream(
					await client.ai.thread.summary.generate(
						{
							messageId,
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

	const summaryText =
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

			sendMessage({ text: 'Summarize Thread' });
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
						<span className="text-xs font-medium">Summarize</span>
					</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-100 p-0" align="end">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<div className="flex items-center gap-2">
						<span className="relative inline-flex items-center justify-center rounded-full bg-linear-to-r from-violet-600 to-fuchsia-600 py-1.5 px-4">
							<Sparkles className="size-3.5" />
							<span className="text-sm font-medium ml-1">
								AI Summary (Preview)
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
					) : summaryText ? (
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							components={{
								// Optional: fine-tune rendering
								p: ({ children }) => <p className="mb-2">{children}</p>,
								ul: ({ children }) => (
									<ul className="ml-4 list-disc">{children}</ul>
								),
								ol: ({ children }) => (
									<ol className="ml-4 list-decimal">{children}</ol>
								),
							}}
						>
							{summaryText}
						</ReactMarkdown>
					) : status === 'submitted' || status === 'streaming' ? (
						<div className="space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							Click summarize to generate
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};
