"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Heading from "@tiptap/extension-heading";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import {
  Heading2,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Pencil,
  X,
} from "lucide-react";
import TextAlign from "@tiptap/extension-text-align";
import { useState } from "react";
import api from "../api";
import logger from "../components/Logger";

interface TipTapProps {
  editorContent: string;
  onChange: (content: string) => void;
  isEditing: boolean;
}

export function Tiptap({ editorContent, onChange, isEditing }: TipTapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false, // Disable default hard break
        paragraph: false, // Disable default paragraph
      }),
      HardBreak.configure({
        keepMarks: true,
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: "mb-4 whitespace-pre-wrap", // Preserve whitespace
        },
      }),
      ListItem,
      Heading.configure({
        HTMLAttributes: {
          class: "text-xl font-bold capitalize",
        },
        levels: [2],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-2",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-2",
        },
      }),
      TextAlign.configure({
        types: [
          "paragraph",
          "heading",
          "bulletList",
          "orderedList",
          "listItem",
        ],
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "shadow appearance-none min-h-[150px] border rounded w-full py-2 px-3 bg-white text-black text-sm mt-0 md:mt-3 leading-tight focus:outline-none focus:shadow-outline whitespace-pre-wrap",
      },
      handleKeyDown: (view, event) => {
        // Explicitly handle multiple line breaks
        if (event.key === "Enter") {
          if (event.shiftKey) {
            // Shift + Enter creates a hard break
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.hardBreak.create()
              )
            );
            return true;
          } else {
            // Regular enter creates a new paragraph
            const { state, dispatch } = view;
            dispatch(state.tr.split(state.selection.from));
            return true;
          }
        }
        return false;
      },
    },
    content: editorContent,
    onUpdate: ({ editor }) => {
      // Ensure HTML preserves line breaks
      const content = editor
        .getHTML()
        .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
        .replace(/<\/p>/gi, "</p>\n"); // Add newline after paragraphs

      onChange(content);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="relative rounded p-4 w-3/4 mx-auto">
      {isEditing && (
        <div className="flex flex-col justify-stretch min-h-[200px] border rounded border-b-0">
          <div className="flex items-center gap-2 mb-2">
            {/* Bold Button */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded ${
                editor.isActive("bold") ? "bg-gray-200" : ""
              }`}
              title="Bold (Ctrl+B)"
            >
              <b>B</b>
            </button>

            {/* Italic Button */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded ${
                editor.isActive("italic") ? "bg-gray-200" : ""
              }`}
              title="Italic (Ctrl+I)"
            >
              <i>I</i>
            </button>

            {/* Heading Button */}
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`p-2 rounded ${
                editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
              }`}
              title="Heading Level 2"
            >
              <Heading2 />
            </button>

            {/* Bullet List Button */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded ${
                editor.isActive("bulletList") ? "bg-gray-200" : ""
              }`}
              title="Bullet List"
            >
              <List />
            </button>

            {/* Ordered List Button */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded ${
                editor.isActive("orderedList") ? "bg-gray-200" : ""
              }`}
              title="Ordered List"
            >
              <ListOrdered />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {/* Left Align */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded ${
                editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
              }`}
              title="Align Left"
            >
              <AlignLeft />
            </button>

            {/* Center Align */}
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={`p-2 rounded ${
                editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
              }`}
              title="Align Center"
            >
              <AlignCenter />
            </button>

            {/* Right Align */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded ${
                editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
              }`}
              title="Align Right"
            >
              <AlignRight />
            </button>
          </div>

          {/* Editor Content */}
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
