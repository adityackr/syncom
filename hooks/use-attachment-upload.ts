'use client';

import { useCallback, useMemo, useState } from 'react';

export const useAttachmentUpload = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [stagedUrl, setStagedUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const onUploaded = useCallback((url: string) => {
		setStagedUrl(url);
		setIsUploading(false);
		setIsOpen(false);
	}, []);

	const clear = useCallback(() => {
		setStagedUrl(null);
		setIsUploading(false);
	}, []);

	return useMemo(
		() => ({
			isOpen,
			setIsOpen,
			stagedUrl,
			isUploading,
			onUploaded,
			clear,
		}),
		[isOpen, setIsOpen, stagedUrl, isUploading, onUploaded, clear]
	);
};

export type UseAttachmentUpload = ReturnType<typeof useAttachmentUpload>;
