import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const members = [
	{
		id: 1,
		name: 'Aditya Chakraborty',
		imageUrl: 'https://github.com/shadcn.png',
		email: 'aditya.chakraborty@example.com',
	},
];

export const WorkspaceMembersList = () => {
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
								src={member.imageUrl}
								alt={member.name}
								className="object-cover"
							/>
							<AvatarFallback>
								{member.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</div>

					<div className="flex-1 min-w-0">
						<p className="truncate text-sm font-medium">{member.name}</p>
						<p className="truncate text-xs text-muted-foreground">
							{member.email}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};
