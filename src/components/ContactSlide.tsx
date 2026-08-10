import React from "react";

export interface ContactItem {
  icon?: string;
  title?: string;
  text?: string;
}

interface ContactSlideProps {
  title?: string;
  items?: ContactItem[];
}

export const ContactSlide: React.FC<ContactSlideProps> = ({
  title = "Contact",
  items,
}) => {
  return (
    <div className="container">
      {title && <div className="poster-bg-text">{title}</div>}
      <h1>{title}</h1>
      <div className="cont">
        <ul className="contact">
          {items &&
            items.map((item, idx) => (
              <li key={idx}>
                <p>
                  <i className={`fa ${item.icon || "fa-info-circle"} fa-3x`} />
                </p>
                <p>
                  <strong>{item.title}</strong>
                </p>
                <p dangerouslySetInnerHTML={{ __html: item.text || "" }} />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
