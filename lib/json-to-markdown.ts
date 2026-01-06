import { baseExtensions } from '@/components/rich-text-editor/extensions';
import { renderToMarkdown } from '@tiptap/static-renderer/pm/markdown';

export const normalizeWhitespace = (markdown: string) => {
	return markdown
		.replace(/\s+$/gm, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
};

export const tiptapJsonToMarkdown = async (json: string) => {
	// parse json

	let content;

	try {
		content = JSON.parse(json);
	} catch {
		return '';
	}

	const markdown = renderToMarkdown({
		extensions: baseExtensions,
		content,
	});

	return normalizeWhitespace(markdown);
};
