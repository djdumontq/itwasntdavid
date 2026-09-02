import React from "react";

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) return null;

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

  const formatTextStyles = (text: string): React.ReactNode => {
    // Process inline code `code`, bold **text**, and italic *text*
    const codeParts = text.split(/(`[^`]+`)/g);

    return codeParts.map((part, pIdx) => {
      if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
        return (
          <code key={`code-inline-${pIdx}`} className="article_inline_code">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Inside normal text, handle **bold** and *italic*
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith("**") && bPart.endsWith("**") && bPart.length > 3) {
          const innerBold = bPart.slice(2, -2);
          return <strong key={`b-${pIdx}-${bIdx}`}>{innerBold}</strong>;
        }

        const italicParts = bPart.split(/(\*[^*]+\*)/g);
        return italicParts.map((iPart, iIdx) => {
          if (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length > 2) {
            return <em key={`em-${pIdx}-${bIdx}-${iIdx}`}>{iPart.slice(1, -1)}</em>;
          }
          return iPart;
        });
      });
    });
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
