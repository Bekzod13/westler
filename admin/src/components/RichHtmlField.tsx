import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

type Props = {
  value: string
  onChange: (html: string) => void
}

export function RichHtmlField({ value, onChange }: Props) {
  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] px-2 py-2 text-sm text-gray-900 focus:outline-none [&_a]:text-blue-600 [&_a]:underline',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (!editor) return
    const incoming = value || '<p></p>'
    const current = editor.getHTML()
    if (current === incoming) return
    editor.commands.setContent(incoming, { emitUpdate: false })
  }, [value, editor])

  if (!editor) {
    return <div className="min-h-[120px] rounded-lg border border-gray-200 bg-gray-50" aria-hidden />
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white">
      <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-1 py-1">
        <ToolbarBtn
          label="H1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarBtn
          label="H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarBtn
          label="Ж"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarBtn
          label="К"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarBtn
          label="П"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarBtn
          label="•"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarBtn
          label="1."
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarBtn
          label="↩"
          active={false}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        />
      </div>
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  )
}

function ToolbarBtn({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded px-2 py-1 text-xs font-medium',
        active ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
