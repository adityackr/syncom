import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';
import { ChannelList } from './_components/channel-list';
import { WorkspaceHeader } from './_components/workspace-header';
import { WorkspaceMembersList } from './_components/workspace-members-list';

const ChannelListLayout = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<div className="flex h-full w-80 flex-col bg-secondary border-r border-border">
				{/* Header */}
				<div className="flex h-14 items-center border-b border-border px-4">
					<WorkspaceHeader />
				</div>

				<div className="px-4 py-2">{/* <CreateNewChannel /> */}</div>

				{/* Channel List */}
				<div className="flex-1 overflow-y-auto px-4">
					<Collapsible defaultOpen>
						<CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180">
							Main
							<ChevronDown className="size-4 transition-transform duration-200" />
						</CollapsibleTrigger>

						<CollapsibleContent>
							<ChannelList />
						</CollapsibleContent>
					</Collapsible>
				</div>

				{/* Members List */}
				<div className="px-4 py-2 border-t border-border">
					<Collapsible defaultOpen>
						<CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180">
							Members
							<ChevronDown className="size-4 transition-transform duration-200" />
						</CollapsibleTrigger>

						<CollapsibleContent>
							<WorkspaceMembersList />
						</CollapsibleContent>
					</Collapsible>
				</div>
			</div>
		</>
	);
};

export default ChannelListLayout;
