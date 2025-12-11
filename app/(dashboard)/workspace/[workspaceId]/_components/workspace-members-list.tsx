'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { useSuspenseQuery } from '@tanstack/react-query';

export const WorkspaceMembersList = () => {
	const {
		data: { members },
	} = useSuspenseQuery(orpc.channel.list.queryOptions());

	return (
		<div className="space-y-0.5 py-1">
			{members.map((member) => (
				<div
					key={member.id}
					className="flex items-center space-x-3 px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
				>
					<div className="relative">
						<Avatar className="size-8 relative">
							<AvatarImage
								src={getAvatar(member.picture ?? null, member.email!)}
								alt={member.full_name}
								className="object-cover"
							/>
							<AvatarFallback>
								{member.full_name?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
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
