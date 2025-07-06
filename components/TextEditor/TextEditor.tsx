'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Quote,
  Heading2,
  Undo,
  Redo,
  Link as LinkIcon,
} from 'lucide-react';

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function TextEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] outline-none prose max-w-none',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    autofocus: false,
    injectCSS: true,
    editable: true,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return <p className="text-gray-400">Memuat editor...</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 border p-2 rounded bg-gray-50">
        <ToolbarButton icon={<Bold size={16} />} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
        <ToolbarButton icon={<Italic size={16} />} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
        <ToolbarButton icon={<UnderlineIcon size={16} />} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
        <ToolbarButton icon={<Heading2 size={16} />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
        <ToolbarButton icon={<Quote size={16} />} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
        <ToolbarButton icon={<LinkIcon size={16} />} onClick={() => {
          const url = window.prompt('Masukkan URL');
          if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }} />
        <ToolbarButton icon={<Undo size={16} />} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton icon={<Redo size={16} />} onClick={() => editor.chain().focus().redo().run()} />
      </div>

      <div className="border rounded min-h-[200px] p-3 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  onClick,
  active = false,
}: Readonly<{
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1 rounded hover:bg-gray-200 ${active ? 'bg-indigo-100 text-indigo-600' : ''}`}
    >
      {icon}
    </button>
  );
}
