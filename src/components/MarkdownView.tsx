import React from "react";

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) return null;

  // Split by double newlines or lines
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inList = false;
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" = "ul";

  const flushList = () => {
    if (inList && listBuffer.length > 0) {
      if (listType === "ol") {
        elements.push(
          <ol key={`ol-${elements.length}`} className="article_ol">
            {listBuffer.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="article_ul">
            {listBuffer.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }
      listBuffer = [];
      inList = false;
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre key={`code-${elements.length}`} className="article_code_block">
          <code>{codeBuffer.join("\n")}</code>
        </pre>
      );
      codeBuffer = [];
      inCodeBlock = false;
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process markdown links [label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(formatTextStyles(text.substring(lastIndex, match.index)));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a key={`link-${match.index}`} href={url} target={url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
          {label}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(formatTextStyles(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : formatTextStyles(text);
  };

  const formatTextStyles = (text: string): React.ReactNode => {
    // Basic bold **text** and inline `code`
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const segments: React.ReactNode[] = [];
    let lastIdx = 0;
    let bMatch: RegExpExecArray | null;

    while ((bMatch = boldRegex.exec(text)) !== null) {
      if (bMatch.index > lastIdx) {
        segments.push(bMatch.index, text.substring(lastIdx, bMatch.index));
      }
      segments.push(
        <strong key={`b-${bMatch.index}`}>{bMatch[1]}</strong>
      );
      lastIdx = bMatch.index + bMatch[0].length;
    }
    if (lastIdx < text.length) {
      segments.push(text.substring(lastIdx));
    }
    return segments;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code fence ```
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Handle empty line
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Handle Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={`h3-${i}`} className="article_h3">{renderInline(line.substring(4))}</h3>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={`h2-${i}`} className="article_h2">{renderInline(line.substring(3))}</h2>);
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={`h1-${i}`} className="article_h1">{renderInline(line.substring(2))}</h1>);
      continue;
    }

    // Handle Horizontal Rules
    if (line.trim() === "---" || line.trim() === "***") {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="article_divider" />);
      continue;
    }

    // Handle Blockquotes
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={`bq-${i}`} className="article_blockquote">
          {renderInline(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Handle Unordered Lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        flushList();
        inList = true;
        listType = "ul";
      }
      listBuffer.push(line.substring(2));
      continue;
    }

    // Handle Ordered Lists (e.g. 1. , 2. )
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        flushList();
        inList = true;
        listType = "ol";
      }
      listBuffer.push(olMatch[2]);
      continue;
    }

    // Paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="article_p">
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  flushCodeBlock();

  return <div className="article_markdown_body">{elements}</div>;
};
