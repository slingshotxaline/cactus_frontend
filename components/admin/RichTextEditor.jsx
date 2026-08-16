"use client";

import { useRef, useEffect } from "react";

// A dependency-free rich text editor built on the browser's contentEditable
// + execCommand — no TinyMCE/Tiptap install required. Covers the common
// formatting cases (bold/italic/underline/strikethrough, headings, alignment,
// lists, indent, blockquote, links, undo/redo). Swap for Tiptap later if you
// need tables, embeds, or collaborative editing.
const TOOLBAR = [
  { label: "↺", command: "undo", title: "Undo" },
  { label: "↻", command: "redo", title: "Redo" },
  { divider: true },
  { label: "B", command: "bold", title: "Bold", style: "font-bold" },
  { label: "I", command: "italic", title: "Italic", style: "italic" },
  { label: "U", command: "underline", title: "Underline", style: "underline" },
  {
    label: "S",
    command: "strikeThrough",
    title: "Strikethrough",
    style: "line-through",
  },
  { divider: true },
  { label: "H2", command: "formatBlock", value: "h2", title: "Heading 2" },
  { label: "H3", command: "formatBlock", value: "h3", title: "Heading 3" },
  { label: "P", command: "formatBlock", value: "p", title: "Paragraph" },
  { label: "❝", command: "formatBlock", value: "blockquote", title: "Quote" },
  { divider: true },
  { label: "⇤", command: "justifyLeft", title: "Align left" },
  { label: "⇔", command: "justifyCenter", title: "Align center" },
  { label: "⇥", command: "justifyRight", title: "Align right" },
  { divider: true },
  { label: "• List", command: "insertUnorderedList", title: "Bulleted list" },
  { label: "1. List", command: "insertOrderedList", title: "Numbered list" },
  { label: "→In", command: "indent", title: "Indent" },
  { label: "←Out", command: "outdent", title: "Outdent" },
  { divider: true },
  { label: "Link", command: "createLink", title: "Insert link", prompt: true },
  { label: "Clear", command: "removeFormat", title: "Clear formatting" },
];

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const isFirstRender = useRef(true);

  // Only push `value` into the DOM on first mount / external resets, so
  // typing doesn't fight with React re-rendering the contentEditable div.
  useEffect(() => {
    if (isFirstRender.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  const exec = (command, arg) => {
    editorRef.current?.focus();
    if (command === "createLink") {
      const url = prompt("Link URL:");
      if (url) document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false, arg);
    }
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 p-2">
        {TOOLBAR.map((btn, i) =>
          btn.divider ? (
            <span key={i} className="w-px h-5 bg-gray-200 mx-1" />
          ) : (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              onClick={() => exec(btn.command, btn.value)}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100 min-w-[28px]"
            >
              {btn.label}
            </button>
          )
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="prose max-w-none p-4 min-h-[240px] text-sm focus:outline-none"
        suppressContentEditableWarning
      />
    </div>
  );
}
