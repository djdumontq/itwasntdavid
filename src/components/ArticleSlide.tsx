import React from "react";
import { BlogPostFull } from "../data/posts";
import { MarkdownView } from "./MarkdownView";
import { TinaMarkdown } from "tinacms/dist/rich-text";

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
          <div className="article_hero_image_wrapper pictureside">
            <img
              src={post.image}
              alt={post.title}
              className="article_hero_image rowdecoration"
            />
          </div>
        )}
      </header>

      {/* Main Article Markdown Content */}
      <section className="article_content_wrapper">
        {isRichText ? (
          <div className="article_markdown_body">
            <TinaMarkdown content={post.body} />
          </div>
        ) : (
          <MarkdownView content={typeof post.body === "string" ? post.body : ""} />
        )}
      </section>

      {/* Author Card Footer */}
      <footer className="article_author_card">
        <img
          src="/images/profile-small.png"
          alt="David Dumont"
          className="article_author_avatar"
        />
        <div className="article_author_info">
          <h4>David Dumont</h4>
          <p className="article_author_role">
            {lang === "de"
              ? "Markenberater & Verfechter digitaler Souveränität"
              : "Brand Consultant & Digital Sovereignty Advocate"}
          </p>
          <p className="article_author_bio">
            {lang === "de"
              ? "Ich berate Unternehmen bei der Gestaltung ehrlicher Markenstrategien und dem Aufbau unabhängiger, selbstgehosteter Open-Source-Infrastrukturen."
              : "Helping organizations design honest strategies, write memorable stories, and take ownership of their digital stack with open-source tools."}
          </p>
          <a href={lang === "de" ? "#/de/contact" : "#/contact"} className="article_author_cta">
            {lang === "de" ? "Gespräch anfragen" : "Get in touch"} <i className="fas fa-arrow-right" />
          </a>
        </div>
      </footer>
    </div>
  );
};
