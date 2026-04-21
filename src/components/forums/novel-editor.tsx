"use client";

import { EditorRoot, EditorContent, Placeholder, StarterKit } from "novel";
import type { JSONContent } from "novel";

interface NovelEditorProps {
  initialContent?: JSONContent;
  onChange: (content: JSONContent) => void;
  noHeadings?: boolean;
}

export function NovelEditor({ initialContent, onChange, noHeadings }: NovelEditorProps) {
  const extensions = [
    noHeadings ? StarterKit.configure({ heading: false }) : StarterKit,
    Placeholder.configure({
      placeholder: noHeadings ? "Write a reply…" : "Write your post content here…",
    }),
  ];

  return (
    <EditorRoot>
      <EditorContent
        initialContent={initialContent}
        extensions={extensions}
        className="min-h-60 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        editorProps={{
          attributes: {
            class: "prose prose-sm max-w-none outline-none min-h-[200px]",
          },
        }}
        onUpdate={({ editor }) => {
          onChange(editor.getJSON());
        }}
      />
    </EditorRoot>
  );
}
