import { cn } from '@/lib/utils';
import { Editor, useEditorState } from '@tiptap/react';
import {
	Bold,
	Code,
	Italic,
	ListIcon,
	ListOrdered,
	Redo,
	Strikethrough,
	Undo,
} from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';
import { Toggle } from '../ui/toggle';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../ui/tooltip';

type MenuBarProps = {
	editor: Editor | null;
};

export const EditorMenuBar: FC<MenuBarProps> = ({ editor }) => {
	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => {
			if (!editor) {
				return null;
			}
			return {
				isBold: editor.isActive('bold'),
				isItalic: editor.isActive('italic'),
				isStrike: editor.isActive('strike'),
				isCodeBlock: editor.isActive('codeBlock'),
				isBulletList: editor.isActive('bulletList'),
				isOrderedList: editor.isActive('orderedList'),
				canUndo: editor.can().undo(),
				canRedo: editor.can().redo(),
			};
		},
	});

	if (!editor) {
		return null;
	}

	return (
		<div className="border border-input border-t-0 border-x-0 rounded-t-lg p-2 bg-card flex flex-wrap gap-1 items-center">
			<TooltipProvider>
				<div className="flex flex-wrap gap-1 items-center">
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size={'sm'}
								pressed={editorState?.isBold}
								onPressedChange={() =>
									editor.chain().focus().toggleBold().run()
								}
								className={cn(
									editorState?.isBold && 'bg-muted text-muted-foreground'
								)}
							>
								<Bold />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Bold</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size={'sm'}
								pressed={editorState?.isItalic}
								onPressedChange={() =>
									editor.chain().focus().toggleItalic().run()
								}
								className={cn(
									editorState?.isItalic && 'bg-muted text-muted-foreground'
								)}
							>
								<Italic />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Italic</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size={'sm'}
								pressed={editorState?.isStrike}
								onPressedChange={() =>
									editor.chain().focus().toggleStrike().run()
								}
								className={cn(
									editorState?.isStrike && 'bg-muted text-muted-foreground'
								)}
							>
								<Strikethrough />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Italic</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size={'sm'}
								pressed={editorState?.isCodeBlock}
								onPressedChange={() =>
									editor.chain().focus().toggleCodeBlock().run()
								}
								className={cn(
									editorState?.isCodeBlock && 'bg-muted text-muted-foreground'
								)}
							>
								<Code />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Code Block</TooltipContent>
					</Tooltip>
				</div>

				<div className="w-px h-6 bg-border mx-2"></div>

				<div className="flex flex-wrap gap-1 items-center">
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size={'sm'}
								pressed={editorState?.isBulletList}
								onPressedChange={() =>
									editor.chain().focus().toggleBulletList().run()
								}
								className={cn(
									editorState?.isBulletList && 'bg-muted text-muted-foreground'
								)}
							>
								<ListIcon />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Bullet List</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size={'sm'}
								pressed={editorState?.isOrderedList}
								onPressedChange={() =>
									editor.chain().focus().toggleOrderedList().run()
								}
								className={cn(
									editorState?.isOrderedList && 'bg-muted text-muted-foreground'
								)}
							>
								<ListOrdered />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Ordered List</TooltipContent>
					</Tooltip>
				</div>

				<div className="w-px h-6 bg-border mx-2"></div>

				<div className="flex flex-wrap gap-1 items-center">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size={'sm'}
								variant={'ghost'}
								type="button"
								onClick={() => editor.chain().focus().undo().run()}
								disabled={!editorState?.canUndo}
							>
								<Undo />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Undo</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size={'sm'}
								variant={'ghost'}
								type="button"
								onClick={() => editor.chain().focus().redo().run()}
								disabled={!editorState?.canRedo}
							>
								<Redo />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Redo</TooltipContent>
					</Tooltip>
				</div>
			</TooltipProvider>
		</div>
	);
};
