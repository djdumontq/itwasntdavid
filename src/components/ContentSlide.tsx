import React from "react";

export interface ContentRow {
  rowId?: string;
  heading?: string;
  text?: string;
  image?: string;
  isDarkRow?: boolean;
}

interface ContentSlideProps {
  title: string;
  rows?: ContentRow[];
}

export const ContentSlide: React.FC<ContentSlideProps> = ({ title, rows }) => {
  return (
    <div className="container">
      <h1>{title}</h1>
      {rows &&
        rows.map((row, idx) => (
          <div
            key={row.rowId || idx}
            id={row.rowId}
            className={`content_row ${row.isDarkRow ? "blackrow" : ""}`}
          >
            <div className="textside">
              {row.heading && <h2>{row.heading}</h2>}
              {row.text && <p>{row.text}</p>}
            </div>
            {row.image && (
              <div className="pictureside">
                <img
                  className="rowdecoration"
                  src={row.image}
                  alt={row.heading || "Decoration"}
                  onError={(e) => {
                    // Fallback pattern SVG
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='350' viewBox='0 0 500 350'><rect width='500' height='350' fill='%232C4251' opacity='0.1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%232C4251' font-size='24' font-family='sans-serif'>David Dumont Strategy</text></svg>";
                  }}
                />
              </div>
            )}
          </div>
        ))}
    </div>
  );
};
