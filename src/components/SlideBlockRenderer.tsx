import React from "react";
import { WelcomeChat } from "./WelcomeChat";
import { ContentSlide } from "./ContentSlide";
import { ContactSlide } from "./ContactSlide";
import { ImprintSlide } from "./ImprintSlide";
import { TimelineSlide } from "./TimelineSlide";
import { BentoGridSlide } from "./BentoGridSlide";
import { tinaField } from "tinacms/dist/react";

interface SlideBlockRendererProps {
  block: any;
  slideTitle?: string;
  onNavigateSlide: (id: string) => void;
  isActive: boolean;
}

export const SlideBlockRenderer: React.FC<SlideBlockRendererProps> = ({
  block,
  slideTitle,
  onNavigateSlide,
  isActive,
}) => {
  if (!block) return null;

  // Handles both raw JSON (_template) and TinaCMS GraphQL (__typename e.g. PagesBlocksChat_module)
  const rawTypeName = block._template || block.__typename || block.type || "";
  const normalized = rawTypeName
    .replace(/^PagesBlocks/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (normalized.includes("chat")) {
    return (
      <div data-tina-field={tinaField(block)}>
        <WelcomeChat
          messages={block.chatMessages || []}
          onNavigateSlide={onNavigateSlide}
          isActive={isActive}
        />
      </div>
    );
  }

  if (normalized.includes("content") || normalized.includes("row")) {
    return (
      <div data-tina-field={tinaField(block)}>
        <ContentSlide
          title={slideTitle || ""}
          rows={block.rows || []}
        />
      </div>
    );
  }

  if (normalized.includes("contact")) {
    return (
      <div data-tina-field={tinaField(block)}>
        <ContactSlide
          title={slideTitle}
          items={block.items || []}
        />
      </div>
    );
  }

  if (normalized.includes("legal") || normalized.includes("imprint")) {
    return (
      <div data-tina-field={tinaField(block)}>
        <ImprintSlide title={slideTitle} text={block.text || block.body} />
      </div>
    );
  }

  if (normalized.includes("timeline")) {
    return (
      <div data-tina-field={tinaField(block)}>
        <TimelineSlide
          title={slideTitle}
          introHeading={block.introHeading}
          introText={block.introText}
          items={block.items || []}
        />
      </div>
    );
  }

  if (normalized.includes("bento")) {
    return (
      <div data-tina-field={tinaField(block)}>
        <BentoGridSlide
          title={slideTitle}
          heading={block.heading}
          subheading={block.subheading}
          cards={block.cards || []}
        />
      </div>
    );
  }

  if (normalized.includes("quote")) {
    return (
      <div className="container" data-tina-field={tinaField(block)}>
        {slideTitle && <h1>{slideTitle}</h1>}
        <blockquote
          style={{
            fontSize: "32px",
            lineHeight: 1.5,
            fontStyle: "italic",
            borderLeft: "4px solid var(--color-accent)",
            paddingLeft: "24px",
            margin: "40px 0",
            color: "var(--color-dark)",
          }}
        >
          "{block.quote}"
          {block.author && (
            <footer
              style={{
                fontSize: "20px",
                marginTop: "12px",
                fontStyle: "normal",
                fontWeight: 600,
              }}
            >
              — {block.author}
            </footer>
          )}
        </blockquote>
      </div>
    );
  }

  return null;
};
