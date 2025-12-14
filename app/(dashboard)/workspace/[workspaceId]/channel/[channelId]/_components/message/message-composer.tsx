import { RichTextEditor } from '@/components/rich-text-editor/editor';
import { Button } from '@/components/ui/button';
import { ImageIcon, Send } from 'lucide-react';
import { FC } from 'react';

type MessageComposerProps = {
	value: string;
	onChange: (value: string) => void;
};

export const MessageComposer: FC<MessageComposerProps> = ({
	value,
	onChange,
}) => {
	return (
		<>
			<RichTextEditor
				field={{ value, onChange }}
				sendButton={
					<Button type="button" size="sm">
						<Send className="size-4 mr-1" />
						Send
					</Button>
				}
				footerLeft={
					<Button type="button" size="sm" variant="outline">
						<ImageIcon />
						Attach
					</Button>
				}
			/>
		</>
	);
};
