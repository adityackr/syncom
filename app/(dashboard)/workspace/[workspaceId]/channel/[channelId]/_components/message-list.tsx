/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { orpc } from '@/lib/orpc';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageItem } from './message/message-item';

export const MessageList = () => {
	const { channelId } = useParams<{ channelId: string }>();
	const {
		messages,
		scrollRef,
		bottomRef,
		handleScroll,
		scrollToBottom,
		isAtBottom,
		isEmpty,
		isFetchingNextPage,
	} = useMessageList(channelId);

	return (
		<div className="relative h-full">
			<div
				className="h-full overflow-y-auto flex flex-col space-y-1"
				ref={scrollRef}
				onScroll={handleScroll}
			>
				{isEmpty ? (
					<div className="flex h-full px-4 pt-4">
						<EmptyState
							title="No messages yet"
							description="Start a conversation by sending the first message"
							href="#"
							buttonText="Send a message"
						/>
					</div>
				) : (
					messages?.map((message) => (
						<MessageItem key={message.id} message={message} />
					))
				)}

				<div ref={bottomRef}></div>
			</div>

			{isFetchingNextPage && (
				<div className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-center justify-center">
					<div className="flex items-center gap-2 rounded-md bg-linear-to-b from-white/80 to-transparent dark:from-neutral-900/80 backdrop-blur px-3 py-1">
						<Loader2 className="size-4 animate-spin text-muted-foreground" />
						<span>Loading previous messages...</span>
					</div>
				</div>
			)}

			{!isAtBottom && (
				<Button
					type="button"
					size="sm"
					className="absolute bottom-4 right-5 z-20 size-10 rounded-full hover:shadow-xl transition-all duration-200"
					onClick={scrollToBottom}
				>
					<ChevronDown className="size-4" />
				</Button>
			)}
		</div>
	);
};

/**
 * Custom hook to manage message list scrolling and pagination
 */
const useMessageList = (channelId: string) => {
	const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const lastItemIdRef = useRef<string | undefined>(undefined);
	const [isAtBottom, setIsAtBottom] = useState(false);

	const infiniteOptions = orpc.message.list.infiniteOptions({
		input: (pageParam: string | undefined) => ({
			channelId,
			cursor: pageParam,
			limit: 30,
		}),
		queryKey: ['message.list', channelId],
		initialPageParam: undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		select: (data) => ({
			pages: [...data.pages]
				.map((page) => ({
					...page,
					items: [...page.items].reverse(),
				}))
				.reverse(),
			pageParams: [...data.pageParams].reverse(),
		}),
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetching,
		isLoading,
		error,
	} = useInfiniteQuery({
		...infiniteOptions,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});

	const messages = useMemo(() => {
		return data?.pages?.flatMap((page) => page.items) ?? [];
	}, [data]);

	const isEmpty = !isLoading && !error && messages.length === 0;

	const isNearBottom = (el: HTMLDivElement) =>
		el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

	// Initial scroll to bottom when messages first load
	useEffect(() => {
		if (!hasInitialScrolled && data?.pages.length) {
			const el = scrollRef.current;
			if (el) {
				bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
				setHasInitialScrolled(true);
				setIsAtBottom(true);
			}
		}
	}, [data?.pages.length, hasInitialScrolled]);

	// Keep view pinned to bottom on late content growth (e.g. images)
	useEffect(() => {
		const el = scrollRef.current;

		if (!el) return;

		const scrollToBottomIfNeeded = () => {
			if (isAtBottom || !hasInitialScrolled) {
				requestAnimationFrame(() => {
					bottomRef.current?.scrollIntoView({
						block: 'end',
						behavior: 'smooth',
					});
				});
			}
		};

		const onImageLoad = (e: Event) => {
			if (e.target instanceof HTMLImageElement) {
				scrollToBottomIfNeeded();
			}
		};

		el.addEventListener('load', onImageLoad, true);

		const resizeObserver = new ResizeObserver(() => {
			scrollToBottomIfNeeded();
		});

		resizeObserver.observe(el);

		const mutationObserver = new MutationObserver(() => {
			scrollToBottomIfNeeded();
		});

		mutationObserver.observe(el, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		});

		return () => {
			el.removeEventListener('load', onImageLoad, true);
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	}, [isAtBottom, hasInitialScrolled]);

	// Handle new messages - auto-scroll if at bottom, show notification otherwise
	useEffect(() => {
		if (!messages.length) return;

		const lastId = messages[messages.length - 1].id;
		const prevLastId = lastItemIdRef.current;
		const el = scrollRef.current;

		if (prevLastId && lastId !== prevLastId) {
			if (el && isNearBottom(el)) {
				requestAnimationFrame(() => {
					el.scrollTop = el.scrollHeight;
				});

				setIsAtBottom(true);
			}
		}

		lastItemIdRef.current = lastId;
	}, [messages]);

	const handleScroll = () => {
		const el = scrollRef.current;

		if (!el) return;

		// Load more messages when scrolling to top
		if (el.scrollTop <= 80 && hasNextPage && !isFetching) {
			const prevScrollHeight = el.scrollHeight;
			const prevScrollTop = el.scrollTop;
			fetchNextPage().then(() => {
				const newScrollHeight = el.scrollHeight;
				el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
			});
		}

		setIsAtBottom(isNearBottom(el));
	};

	const scrollToBottom = () => {
		const el = scrollRef.current;
		if (!el) return;
		bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
		setIsAtBottom(true);
	};

	return {
		messages,
		scrollRef,
		bottomRef,
		handleScroll,
		scrollToBottom,
		isAtBottom,
		isEmpty,
		isFetchingNextPage,
	};
};
