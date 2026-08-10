import React from "react";

export interface BentoCard {
  title?: string;
  text?: string;
  image?: string;
  gridSize?: "4" | "6" | "8" | "12" | string;
  isDarkCard?: boolean;
}

interface BentoGridSlideProps {
  title?: string;
  heading?: string;
  subheading?: string;
  cards?: BentoCard[];
}

export const BentoGridSlide: React.FC<BentoGridSlideProps> = ({
  title,
  heading,
  subheading,
  cards,
}) => {
  return (
    <div className="container">
      {title && <div className="poster-bg-text">{title}</div>}
      {title && <h1>{title}</h1>}
      <div className="bento_container">
        {(heading || subheading) && (
          <div className="bento_intro">
            {heading && <h2>{heading}</h2>}
            {subheading &&
              subheading.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
          </div>
        )}
        {cards && cards.length > 0 && (
          <div className="bento_grid">
            {cards.map((card, idx) => {
              const spanClass = `bento_span_${card.gridSize || "4"}`;
              const isDark = card.isDarkCard ? "bento_card_dark" : "";
              
              // Apply a small organic rotation tilt based on index to resemble pinned cards
              const tilt = (idx % 2 === 0 ? -0.5 : 0.6) * (idx % 3 === 0 ? 1.2 : 0.8);
              const cardStyle: React.CSSProperties = {
                transform: `rotate(${tilt.toFixed(2)}deg)`,
              };

              return (
                <div
                  key={idx}
                  className={`bento_card ${spanClass} ${isDark}`}
                  style={cardStyle}
                >
                  <div className="bento_card_content">
                    {card.title && <h3>{card.title}</h3>}
                    {card.text &&
                      card.text.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                  </div>
                  {card.image && (
                    <div className="bento_card_image_wrapper">
                      <img
                        className="bento_card_image"
                        src={card.image}
                        alt={card.title || "Card illustration"}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
