import React from "react";

export interface AuthorCtaCardProps {
  lang?: "en" | "de";
  className?: string;
  style?: React.CSSProperties;
  onNavigate?: (slideId: string) => void;
}

export const AuthorCtaCard: React.FC<AuthorCtaCardProps> = ({
  lang = "en",
  className = "",
  style,
  onNavigate,
}) => {
  const contactHref = lang === "de" ? "#/de/contact" : "#/contact";

  const handleClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate("contact");
    }
  };

  return (
    <footer className={`article_author_card ${className}`} style={style}>
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
        <a
          href={contactHref}
          onClick={handleClick}
          className="article_author_cta"
        >
          {lang === "de" ? "Gespräch anfragen" : "Get in touch"}{" "}
          <i className="fas fa-arrow-right" />
        </a>
      </div>
    </footer>
  );
};
