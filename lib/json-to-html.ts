import { baseExtensions } from '@/components/rich-text-editor/extensions';
import { generateHTML, type JSONContent } from '@tiptap/react';

export const convertJsonToHtml = (json: JSONContent): string => {
	try {
		const content = typeof json === 'string' ? JSON.parse(json) : json;

		return generateHTML(content, baseExtensions);
	} catch {
		console.error('Error converting JSON to HTML');
		return '';
	}
};
