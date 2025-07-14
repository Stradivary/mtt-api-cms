'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Undo,
  Redo,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { DraggableImage } from '../extentions/DraggableImage/DraggableImage';
import TextStyle from '@tiptap/extension-text-style';
import FontSize from 'tiptap-extension-font-size';
import ImageGalleryModal from '../ImageGalleryModal/ImageGalleryModal';
import FontSizeSelector from '../FontSizeSelector/FontSizeSelector';
interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function TextEditor({ value, onChange }: TiptapEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      DraggableImage,
      Image.extend({
        addAttributes() {
          return {
            src: {},
            alt: { default: null },
            title: { default: null },
            style: { default: 'max-width:100%; height:auto;' },
          };
        },
        draggable: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontSize.configure({
        types: ['textStyle'],
      }),
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

  const handleImageSelect = (url: string) => {
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'draggableImage',
          attrs: {
            src: url,
            alt: '',
            width: '400px',
          },
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '\u200B' }],
        },
      ])
      .run();
  };


  return (
    <div>
      <ImageGalleryModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelectImage={handleImageSelect}
      />
      <div className="flex flex-wrap gap-2 mb-2 border p-2 rounded bg-gray-50">
        <ToolbarButton icon={<Bold size={16} />} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
        <ToolbarButton icon={<Italic size={16} />} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
        <ToolbarButton icon={<UnderlineIcon size={16} />} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
        <ToolbarButton icon={<Heading2 size={16} />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
        <ToolbarButton icon={<Undo size={16} />} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton icon={<Redo size={16} />} onClick={() => editor.chain().focus().redo().run()} />
        <FontSizeSelector editor={editor} />
        <ToolbarButton
          icon={<AlignLeft size={16} />}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
        />
        <ToolbarButton
          icon={<AlignCenter size={16} />}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
        />
        <ToolbarButton
          icon={<AlignRight size={16} />}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
        />
        <ToolbarButton
          icon={<AlignJustify size={16} />}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
        />
        <ToolbarButton
          icon={<ImageIcon size={16} />}
          onClick={() => setShowImageModal(true)}
        />
      </div>
      <div className="border rounded min-h-[300px] p-3 bg-white relative">
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
