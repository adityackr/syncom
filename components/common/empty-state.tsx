import { PackageOpen, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { buttonVariants } from '../ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '../ui/empty';

type EmptyStateProps = {
	title: string;
	description: string;
	buttonText: string;
	href: string;
};

export const EmptyState: FC<EmptyStateProps> = ({
	title,
	description,
	buttonText,
	href,
}) => {
	return (
		<Empty className="border border-dashed">
			<EmptyHeader>
				<EmptyMedia variant="icon" className="bg-primary/10">
					<PackageOpen className="size-5 text-primary" />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Link href={href} className={buttonVariants()}>
					<PlusCircle />
					{buttonText}
				</Link>
			</EmptyContent>
		</Empty>
	);
};
