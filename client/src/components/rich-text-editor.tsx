import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link, 
  Code, 
  Image,
  Quote,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor prose prose-invert max-w-none focus:outline-none min-h-[200px] dark-text',
        placeholder,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border dark-border rounded-lg dark-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b dark-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('bold') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('italic') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('strike') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('bulletList') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('orderedList') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('code') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('codeBlock') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 h-8 w-8 ${editor.isActive('blockquote') ? 'bg-accent-blue' : 'hover:dark-border'}`}
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 h-8 w-8 hover:dark-border"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 h-8 w-8 hover:dark-border"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[200px] dark-text"
      />
    </div>
  );
}
