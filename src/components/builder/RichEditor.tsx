"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState, useRef } from "react";
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
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setShowPrompt(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    // We handle blur manually via the click outside listener to support the link prompt
  });

  const openLinkPrompt = () => {
    if (!editor) return;

    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').run();
      const url = editor.getAttributes("link").href;
      setLinkUrl(url || "");
      const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ");
      setLinkText(selectedText || "");
    } else if (!editor.state.selection.empty) {
      const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ");
      setLinkText(selectedText);
      setLinkUrl("");
    } else {
      setLinkText("");
      setLinkUrl("");
    }
    setShowPrompt(true);
  };

  const submitLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowPrompt(false);
      return;
    }

    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const textToInsert = linkText || finalUrl;
    editor.chain().focus().insertContent(`<a href="${finalUrl}" target="_blank" class="editor-link">${textToInsert}</a>`).run();
    setShowPrompt(false);
  };

  // Keep in sync with external value changes (e.g. AI generation)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isFocused && !showPrompt) {
      editor.commands.setContent(value);
    }
  }, [value, editor, isFocused, showPrompt]);

  if (!mounted || !editor) return null;

  return (
    <div ref={containerRef} className={`${s.container} ${className || ""}`}>
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
            onClick={openLinkPrompt} 
            className={(editor.isActive("link") || showPrompt) ? s.active : ""}
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
      
      {showPrompt && (
        <div className={s.linkPrompt}>
          <form onSubmit={submitLink}>
            <input 
              autoFocus
              type="text" 
              placeholder="Text to display..." 
              value={linkText} 
              onChange={(e) => setLinkText(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="example.com/in/profile" 
              value={linkUrl} 
              onChange={(e) => setLinkUrl(e.target.value)} 
              required
            />
            <div className={s.linkPromptButtons}>
               <button type="button" className={s.btnCancel} onClick={() => setShowPrompt(false)}>Cancel</button>
               <button type="submit" className={s.btnSave}>Save</button>
            </div>
          </form>
        </div>
      )}
      
      <EditorContent editor={editor} className={s.content} />
    </div>
  );
}
