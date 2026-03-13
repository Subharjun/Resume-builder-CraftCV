"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState } from "react";
import s from "./RichEditor.module.css";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichEditor({ value, onChange, placeholder, className }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  const setLink = () => {
    if (!editor) return;

    if (editor.state.selection.empty) {
      const text = window.prompt("Text to display:");
      if (!text) return;

      const url = window.prompt("URL:");
      if (url === null || url === "") return;

      editor.chain().focus().insertContent(`<a href="${url}" target="_blank" class="editor-link">${text}</a>`).run();
    } else {
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("URL:", previousUrl);

      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
    }
  };

  // Keep in sync with external value changes (e.g. AI generation)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isFocused) {
      editor.commands.setContent(value);
    }
  }, [value, editor, isFocused]);

  if (!mounted || !editor) return null;

  return (
    <div className={`${s.container} ${className || ""}`}>
      {isFocused && (
        <div className={s.toolbar}>
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            className={editor.isActive("bold") ? s.active : ""}
            title="Bold"
          >
            <b>B</b>
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            className={editor.isActive("italic") ? s.active : ""}
            title="Italic"
          >
            <i>I</i>
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            className={editor.isActive("underline") ? s.active : ""}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button 
            onClick={setLink} 
            className={editor.isActive("link") ? s.active : ""}
            title="Add Link"
          >
            🔗
          </button>
          <div className={s.divider} />
          <button 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            className={editor.isActive("bulletList") ? s.active : ""}
            title="Bullet List"
          >
            • List
          </button>
          <div className={s.divider} />
          <button 
            onClick={() => editor.chain().focus().setTextAlign('left').run()} 
            className={editor.isActive({ textAlign: 'left' }) ? s.active : ""}
            title="Align Left"
          >
            Left
          </button>
          <button 
            onClick={() => editor.chain().focus().setTextAlign('right').run()} 
            className={editor.isActive({ textAlign: 'right' }) ? s.active : ""}
            title="Align Right"
          >
            Right
          </button>
        </div>
      )}
      <EditorContent editor={editor} className={s.content} />
    </div>
  );
}
