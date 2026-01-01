import { SafeContent } from '@/components/rich-text-editor/safe-content';
import { Button } from '@/components/ui/button';
import { orpc } from '@/lib/orpc';
import { useThreadContext } from '@/providers/thread-provider';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, X } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import { ThreadReply } from './thread-reply';
import { ThreadReplyForm } from './thread-reply-form';

type ThreadSidebarProps = {
	user: KindeUser<Record<string, unknown>>;
};

export const ThreadSidebar: FC<ThreadSidebarProps> = ({ user }) => {
	const { selectedThreadId, closeThread } = useThreadContext();

	const { data, isLoading } = useQuery(
		orpc.message.thread.list.queryOptions({
			input: {
				messageId: selectedThreadId!,
			},
			enabled: Boolean(selectedThreadId),
		})
	);

	return (
		<div className="w-120 border-l flex flex-col h-full">
			{/* Header */}
			<div className="border-b h-14 px-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<MessageSquare className="size-4" />
					<span>Thread</span>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" onClick={closeThread}>
						<X className="size-4" />
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto">
				{data && (
					<>
						<div className="p-4 border-b bg-muted/20">
							<div className="flex space-x-3">
								<Image
									src={data.parent.authorAvatar}
									alt={data.parent.authorName}
									width={32}
									height={32}
									className="size-8 rounded-full shrink-0"
								/>
								<div className="flex-1 space-y-1 min-w-0">
									<div className="flex items-center space-x-2">
										<span className="font-medium text-sm">
											{data.parent.authorName}
										</span>
										<span className="text-xs text-muted-foreground">
											{new Intl.DateTimeFormat('en-US', {
												hour: 'numeric',
												minute: 'numeric',
												hour12: true,
												month: 'short',
												day: 'numeric',
											}).format(data.parent.createdAt)}
										</span>
									</div>

									<SafeContent
										className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
										content={JSON.parse(data.parent.content)}
									/>
								</div>
							</div>
						</div>

						{/* Thread Replies */}
						<div className="p-2">
							<p className="text-xs text-muted-foreground mb-3 px-2">
								{data.messages.length} replies
							</p>

							<div className="space-y-1">
								{data.messages.map((reply) => (
									<ThreadReply key={reply.id} message={reply} />
								))}
							</div>
						</div>
					</>
				)}
			</div>

			{/* Thread reply form */}
			<div className="border-t p-4">
				<ThreadReplyForm threadId={selectedThreadId!} user={user} />
			</div>
		</div>
	);
};
