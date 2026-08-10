import React from "react";

export interface TimelineItem {
  title?: string;
  subtitle?: string;
  text?: string;
}

interface TimelineSlideProps {
  title?: string;
  introHeading?: string;
  introText?: string;
  items?: TimelineItem[];
}

export const TimelineSlide: React.FC<TimelineSlideProps> = ({
  title,
  introHeading,
  introText,
  items,
}) => {
  return (
    <div className="container">
      {title && <div className="poster-bg-text">{title}</div>}
      {title && <h1>{title}</h1>}
      <div className="timeline_container">
        {(introHeading || introText) && (
          <div className="timeline_intro">
            {introHeading && <h2>{introHeading}</h2>}
            {introText &&
              introText.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
          </div>
        )}
        {items && items.length > 0 && (
          <div className="timeline_list">
            {items.map((item, idx) => (
              <div key={idx} className="timeline_item">
                <div className="timeline_dot" />
                <div className="timeline_content">
                  {item.title && <h3>{item.title}</h3>}
                  {item.subtitle && <h4>{item.subtitle}</h4>}
                  {item.text &&
                    item.text.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
