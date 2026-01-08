'use client';

import { User } from '@/app/schemas/realtime.schema';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePresence } from '@/hooks/use-presence';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export const WorkspaceMembersList = () => {
	const {
		data: { members },
	} = useSuspenseQuery(orpc.channel.list.queryOptions());

	const { data: workspaceData } = useQuery(orpc.workspace.list.queryOptions());

	const currentUser = !workspaceData?.user
		? null
		: ({
				id: workspaceData.user.id,
				full_name: workspaceData.user.given_name,
				email: workspaceData.user.email,
				picture: workspaceData.user.picture,
		  } satisfies User);

	const params = useParams();

	const { onlineUsers } = usePresence({
		room: `workspace-${params.workspaceId}`,
		currentUser,
	});

	const onlineUserIds = new Set(onlineUsers.map((user) => user.id));

	return (
		<div className="space-y-0.5 py-1">
			{members.map((member) => (
				<div
					key={member.id}
					className="flex items-center space-x-3 px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
				>
					<div className="relative">
						<Avatar className="size-8 relative">
							<Image
								src={getAvatar(member.picture ?? null, member.email!)}
								alt={member.full_name ?? 'Member'}
								width={32}
								height={32}
								className="object-cover"
							/>
							<AvatarFallback>
								{member.full_name?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						{/* Online/Offline status indicator */}
						<div
							className={cn(
								'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background',
								member.id && onlineUserIds.has(member.id)
									? 'bg-green-500'
									: 'bg-gray-400'
							)}
						></div>
					</div>

					<div className="flex-1 min-w-0">
						<p className="truncate text-sm font-medium">{member.full_name}</p>
						<p className="truncate text-xs text-muted-foreground">
							{member.email}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};
