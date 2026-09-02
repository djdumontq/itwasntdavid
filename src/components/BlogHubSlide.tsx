import React, { useState } from "react";
import { BlogPostMeta } from "../data/posts";

interface BlogHubSlideProps {
  title?: string;
  posts: BlogPostMeta[];
  lang: "en" | "de";
  onSelectArticle: (slug: string) => void;
}

export const BlogHubSlide: React.FC<BlogHubSlideProps> = ({
  title,
  posts,
  lang,
  onSelectArticle,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Extract all unique tags
  const allTags = ["all", ...Array.from(new Set(posts.flatMap((p) => p.tags || [])))];

  const filteredPosts =
    selectedTag === "all"
      ? posts
      : posts.filter((p) => p.tags?.includes(selectedTag));

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  // Exclude the featured highlight post from the card grid below so it is not shown twice
  const gridPosts =
    selectedTag === "all" && featuredPost
      ? filteredPosts.filter((p) => p.slug !== featuredPost.slug)
      : filteredPosts;

  const displayTitle =
    title || (lang === "de" ? "Notizen & Gedanken" : "Field Notes & Insights");

  const subtitle =
    lang === "de"
      ? "Gedanken zu Marken-Storytelling, digitaler Souveränität und modernen Open-Source-Systemen."
      : "Perspectives on brand storytelling, digital sovereignty, and resilient open-source tools.";

  return (
    <div className="container blog_hub_container">
      <div className="blog_header">
        <h1 className="blog_title">{displayTitle}</h1>
        <p className="blog_subtitle">{subtitle}</p>

        {/* Category Filter Pills */}
        <div className="blog_filter_bar">
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`blog_tag_pill ${selectedTag === tag ? "active" : ""}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag === "all" ? (lang === "de" ? "Alle Artikel" : "All Articles") : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article Banner (when 'all' is selected or featured post matches tag) */}
      {selectedTag === "all" && featuredPost && (
        <div
          className="blog_featured_card"
          onClick={() => onSelectArticle(featuredPost.slug)}
          role="button"
          tabIndex={0}
        >
          <div className="blog_featured_content">
            <div className="blog_card_meta">
              <span className="blog_badge">
                {lang === "de" ? "Im Fokus" : "Featured"}
              </span>
              <span className="blog_meta_date">{featuredPost.date}</span>
              {featuredPost.readingTime && (
                <>
                  <span className="blog_meta_dot">•</span>
                  <span className="blog_meta_time">{featuredPost.readingTime}</span>
                </>
              )}
            </div>

            <h2 className="blog_featured_title">{featuredPost.title}</h2>
            <p className="blog_featured_desc">{featuredPost.description}</p>

            <div className="blog_card_footer">
              <div className="blog_card_tags">
                {featuredPost.tags?.map((t) => (
                  <span key={t} className="blog_card_tag">
                    #{t}
                  </span>
                ))}
              </div>
              <span className="blog_read_more_btn">
                {lang === "de" ? "Artikel lesen" : "Read Article"} <i className="fas fa-arrow-right" />
              </span>
            </div>
          </div>

          {featuredPost.image && (
            <div className="blog_featured_image_wrapper pictureside">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="blog_featured_image rowdecoration"
              />
            </div>
          )}
        </div>
      )}

      {/* Grid of Articles */}
      <div className="blog_grid">
        {gridPosts.map((post) => {
          // If 'all' is selected, optionally skip the featured post from the grid if desired, or show all
          return (
            <article
              key={post.slug}
              className="blog_card"
              onClick={() => onSelectArticle(post.slug)}
              tabIndex={0}
            >
              <div className="blog_card_top">
                <div className="blog_card_meta">
                  <span className="blog_meta_date">{post.date}</span>
                  {post.readingTime && (
                    <>
                      <span className="blog_meta_dot">•</span>
                      <span className="blog_meta_time">{post.readingTime}</span>
                    </>
                  )}
                </div>

                <h3 className="blog_card_title">{post.title}</h3>
                <p className="blog_card_desc">{post.description}</p>
              </div>

              <div className="blog_card_bottom">
                <div className="blog_card_tags">
                  {post.tags?.map((t) => (
                    <span key={t} className="blog_card_tag">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="blog_card_action">
                  <span className="blog_card_link">
                    {lang === "de" ? "Weiterlesen" : "Read More"} <i className="fas fa-arrow-right" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
