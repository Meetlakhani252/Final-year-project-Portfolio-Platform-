"use client";

import type { JSONContent } from "novel";

function renderNode(node: JSONContent, index: number): React.ReactNode {
  if (node.type === "text") {
    let el: React.ReactNode = node.text ?? "";
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") el = <strong key={index}>{el}</strong>;
        if (mark.type === "italic") el = <em key={index}>{el}</em>;
        if (mark.type === "underline") el = <u key={index}>{el}</u>;
        if (mark.type === "strike") el = <s key={index}>{el}</s>;
        if (mark.type === "code") el = <code key={index}>{el}</code>;
        if (mark.type === "link" && mark.attrs?.href) {
          el = (
            <a
              key={index}
              href={mark.attrs.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {el}
            </a>
          );
        }
      }
    }
    return el;
  }

  const children = node.content?.map((child, i) => renderNode(child, i)) ?? [];

  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return <p key={index}>{children}</p>;
    case "heading": {
      const level = node.attrs?.level ?? 2;
      if (level === 1) return <h1 key={index}>{children}</h1>;
      if (level === 2) return <h2 key={index}>{children}</h2>;
      if (level === 3) return <h3 key={index}>{children}</h3>;
      if (level === 4) return <h4 key={index}>{children}</h4>;
      if (level === 5) return <h5 key={index}>{children}</h5>;
      return <h6 key={index}>{children}</h6>;
    }
    case "bulletList":
      return <ul key={index}>{children}</ul>;
    case "orderedList":
      return <ol key={index}>{children}</ol>;
    case "listItem":
      return <li key={index}>{children}</li>;
    case "taskList":
      return <ul key={index} className="list-none pl-0">{children}</ul>;
    case "taskItem":
      return (
        <li key={index} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={node.attrs?.checked ?? false}
            readOnly
            className="mt-1"
          />
          <span>{children}</span>
        </li>
      );
    case "blockquote":
      return <blockquote key={index}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={index}>
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={index} />;
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={node.attrs?.src}
          alt={node.attrs?.alt ?? ""}
          className="rounded-md"
        />
      );
    case "hardBreak":
      return <br key={index} />;
    default:
      return <div key={index}>{children}</div>;
  }
}

export function BlogContentRenderer({ content }: { content: JSONContent }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {renderNode(content, 0)}
    </div>
  );
}
