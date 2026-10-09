import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { BlogPostFull } from "../data/posts";
import { MarkdownView } from "./MarkdownView";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { AuthorCtaCard } from "./AuthorCtaCard";

interface ArticleSlideProps {
  post: BlogPostFull;
  lang: "en" | "de";
  onBackToBlog: () => void;
}

export const ArticleSlide: React.FC<ArticleSlideProps> = ({
  post,
  lang,
  onBackToBlog,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string } | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    if (lightboxImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  const tinaComponents = useMemo(
    () => ({
      blockquote: (props: any) => (
        <blockquote className="article_blockquote">{props.children}</blockquote>
      ),
      code_block: (props: any) => (
        <div className="article_terminal_wrapper">
          <div className="article_terminal_header">
            <span className="terminal_dots">
              <span className="dot dot_red" />
              <span className="dot dot_yellow" />
              <span className="dot dot_green" />
            </span>
            <span className="terminal_title">ai prompt / bash</span>
          </div>
          <pre className="article_code_block">
            <code>{props.value || props.children}</code>
          </pre>
        </div>
      ),
      code: (props: any) => (
        <code className="article_inline_code">{props.children}</code>
      ),
      img: (props: any) => (
        <figure className="article_figure">
          <div
            className="article_img_container"
            onClick={() => setLightboxImage({ src: props.url || props.src, alt: props.alt })}
            role="button"
            tabIndex={0}
            title={lang === "de" ? "Klicken zum Vergrößern" : "Click to enlarge"}
          >
            <img
              src={props.url || props.src}
              alt={props.alt}
              className="article_inline_img"
              loading="lazy"
            />
            <div className="article_img_zoom_hint">
              <i className="fas fa-search-plus" />
              <span>{lang === "de" ? "Vergrößern" : "Enlarge"}</span>
            </div>
          </div>
          {props.alt && <figcaption className="article_figcaption">{props.alt}</figcaption>}
        </figure>
      ),
    }),
    [lang]
  );

  const isRichText = typeof post.body === "object" && post.body !== null;

  return (
    <div className="container article_slide_container">
      {/* Navigation Breadcrumb back to blog overview */}
      <div className="article_slide_nav_bar">
        <button className="article_slide_back_btn" onClick={onBackToBlog}>
          <i className="fas fa-arrow-left" /> {lang === "de" ? "Zurück zu allen Notizen" : "Back to Field Notes"}
        </button>
      </div>

      <header className="article_slide_header">
        <div className="article_meta_top">
          <span className="article_date">{post.date}</span>
          {post.readingTime && (
            <>
              <span className="article_meta_dot">•</span>
              <span className="article_time">{post.readingTime}</span>
            </>
          )}
        </div>

        <h1 className="article_main_title">{post.title}</h1>

        {post.tags && post.tags.length > 0 && (
          <div className="article_tags">
            {post.tags.map((t) => (
              <span key={t} className="article_tag">
                #{t}
              </span>
            ))}
          </div>
        )}

        {post.description && (
          <p className="article_lead_excerpt">{post.description}</p>
        )}

        {post.image && (
          <div className="article_hero_image_wrapper">
            <img
              src={post.image}
              alt={post.title}
              className="article_hero_image"
              onClick={() => setLightboxImage({ src: post.image!, alt: post.title })}
              title={lang === "de" ? "Klicken zum Vergrößern" : "Click to enlarge"}
            />
          </div>
        )}
      </header>

      {/* Main Article Markdown Content */}
      <section className="article_content_wrapper">
        {isRichText ? (
          <div className="article_markdown_body">
            <TinaMarkdown content={post.body} components={tinaComponents} />
          </div>
        ) : (
          <MarkdownView
            content={typeof post.body === "string" ? post.body : ""}
            lang={lang}
            onImageClick={(src, alt) => setLightboxImage({ src, alt })}
          />
        )}
      </section>

      {/* Author Card Footer */}
      <AuthorCtaCard lang={lang} />

      {/* Lightbox Modal rendered via Portal directly into document.body to break out of transformed 3D scroll container */}
      {lightboxImage &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="article_lightbox_overlay"
            onClick={() => setLightboxImage(null)}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="article_lightbox_close_btn"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
              title={lang === "de" ? "Schließen (Esc)" : "Close (Esc)"}
              aria-label="Close Lightbox"
            >
              <i className="fas fa-times" />
            </button>

            <div
              className="article_lightbox_content"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt || "Fullscreen preview"}
                className="article_lightbox_img"
              />
              {lightboxImage.alt && (
                <div className="article_lightbox_caption">
                  {lightboxImage.alt}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
