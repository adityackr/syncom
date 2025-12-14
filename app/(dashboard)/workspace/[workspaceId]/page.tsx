import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { client } from '@/lib/orpc';
import { MessageSquareMore } from 'lucide-react';
import { redirect } from 'next/navigation';
import { CreateNewChannel } from './_components/create-new-channel';

type SingleWorkspacePageProps = {
	params: Promise<{ workspaceId: string }>;
};

const SingleWorkspacePage = async ({ params }: SingleWorkspacePageProps) => {
	const { workspaceId } = await params;
	const { channels } = await client.channel.list();

	if (channels.length > 0) {
		return redirect(`/workspace/${workspaceId}/channel/${channels[0].id}`);
	}

	return (
		<div className="p-16 from-muted/50 to-background h-full bg-linear-to-b from-30% flex flex-1">
			<Empty className="border border-dashed">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<MessageSquareMore />
					</EmptyMedia>
					<EmptyTitle>Start a conversation</EmptyTitle>
					<EmptyDescription>
						Send messages to your team members.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent className="max-w-3xs mx-auto">
					<CreateNewChannel />
				</EmptyContent>
			</Empty>
		</div>
	);
};

export default SingleWorkspacePage;
