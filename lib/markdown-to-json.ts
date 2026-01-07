import { editorExtensions } from '@/components/rich-text-editor/extensions';
import { generateJSON } from '@tiptap/react';
import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

export const markdownToJson = (markdown: string) => {
	const html = md.render(markdown);

	const cleanHtml = DOMPurify.sanitize(html);

	return generateJSON(cleanHtml, editorExtensions);
};
