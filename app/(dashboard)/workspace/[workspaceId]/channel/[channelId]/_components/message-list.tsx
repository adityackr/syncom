/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Button } from '@/components/ui/button';
import { orpc } from '@/lib/orpc';
import { useInfiniteQuery } from '@tanstack/react-query';
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
		newMessages,
		isAtBottom,
	} = useMessageList(channelId);

	return (
		<div className="relative h-full">
			<div
				className="h-full overflow-y-auto"
				ref={scrollRef}
				onScroll={handleScroll}
			>
				{messages?.map((message) => (
					<MessageItem key={message.id} message={message} />
				))}

				<div ref={bottomRef}></div>

				{newMessages && !isAtBottom ? (
					<Button
						type="button"
						className="absolute bottom-4 right-8 rounded-full"
						onClick={scrollToBottom}
					>
						New Messages
					</Button>
				) : null}
			</div>
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
	const [newMessages, setNewMessages] = useState(false);

	const infiniteOptions = orpc.message.list.infiniteOptions({
		input: (pageParam: string | undefined) => ({
			channelId,
			cursor: pageParam,
			limit: 30,
		}),
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

	const isNearBottom = (el: HTMLDivElement) =>
		el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

	// Initial scroll to bottom when messages first load
	useEffect(() => {
		if (!hasInitialScrolled && data?.pages.length) {
			const el = scrollRef.current;
			if (el) {
				el.scrollTop = el.scrollHeight;
				setHasInitialScrolled(true);
				setIsAtBottom(true);
			}
		}
	}, [data?.pages.length, hasInitialScrolled]);

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

				setNewMessages(false);
				setIsAtBottom(true);
			} else {
				setNewMessages(true);
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
		el.scrollTop = el.scrollHeight;
		setNewMessages(false);
		setIsAtBottom(true);
	};

	return {
		messages,
		scrollRef,
		bottomRef,
		handleScroll,
		scrollToBottom,
		newMessages,
		isAtBottom,
	};
};
