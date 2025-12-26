import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { orpc } from '@/lib/orpc';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';
import { MemberItem } from './member-item';

export const MemberOverview = () => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');

	const { data, isLoading, error } = useQuery(
		orpc.workspace.member.list.queryOptions()
	);

	if (error) {
		return <h1>Error: {error.message}</h1>;
	}

	const members = data ?? [];

	const query = search.trim().toLowerCase();

	const filteredMembers = query
		? members.filter((member) => {
				return (
					member.full_name?.toLowerCase().includes(query) ||
					member.email?.toLowerCase().includes(query)
				);
		  })
		: members;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant={'outline'}>
					<Users />
					<span>Members</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="p-0 w-[325px]">
				<div className="p-0">
					{/* Header */}
					<div className="px-4 py-3 border-b">
						<h3 className="font-semibold text-sm">Workspace Members</h3>
						<p className="text-xs text-muted-foreground">Members</p>
					</div>

					{/* Search */}
					<div className="p-3 border-b">
						<div className="relative">
							<Search className="size-4 absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground" />
							<Input
								placeholder="Search Members..."
								className="pl-9 h-8"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>

					{/* Members */}
					<div className="max-h-80 overflow-y-auto">
						{isLoading ? (
							Array.from({ length: 6 }).map((_, index) => (
								<div key={index} className="flex items-center gap-3 px-4 py-2">
									<Skeleton className="size-8 rounded-full" />
									<div className="flex-1 space-y-1">
										<Skeleton className="h-3 w-32" />
										<Skeleton className="h-3 w-20" />
									</div>
								</div>
							))
						) : filteredMembers.length === 0 ? (
							<p className="px-4 py-6 text-sm text-muted-foreground">
								No members found
							</p>
						) : (
							filteredMembers.map((member) => (
								<MemberItem key={member.id} member={member} />
							))
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
