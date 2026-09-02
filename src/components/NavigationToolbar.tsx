import React, { useState, useEffect, useRef } from "react";

interface SlideNav {
  id: string;
  title: string;
}

interface NavigationToolbarProps {
  slides: SlideNav[];
  activeId: string;
  onSelectSlide: (id: string) => void;
  lang: "en" | "de";
  onSelectLanguage: (lang: "en" | "de") => void;
}

export const NavigationToolbar: React.FC<NavigationToolbarProps> = ({
  slides,
  activeId,
  onSelectSlide,
  lang,
  onSelectLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking anywhere outside the menu bar / on page canvas
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener("click", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Animated Backdrop Blur */}
      <div
        className={`menu-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div id="impress-toolbar" ref={toolbarRef}>
        <section id="header-above" className="top-nav">
          <a
            href={lang === "en" ? "#/welcome" : "#/de/welcome"}
            className="brand-title"
            onClick={() => {
              onSelectSlide("welcome");
              setMobileMenuOpen(false);
            }}
          >
            David Dumont
          </a>

          {/* Animated Mobile Hamburger Toggle Button */}
          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <i className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"} />
          </button>

          {/* Smooth Sliding & Fading Menu Drawer */}
          <ul className={`menu ${mobileMenuOpen ? "open" : ""}`}>
            {slides.map((s) => (
              <li key={s.id}>
                <a
                  href={lang === "en" ? `#/${s.id}` : `#/de/${s.id}`}
                  className={activeId === s.id ? "active" : ""}
                  onClick={() => {
                    onSelectSlide(s.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {s.title}
                </a>
              </li>
            ))}
            <li className="lang-switch-item">
              <span className="lang-toggle-container">
                <button
                  className={`lang-btn ${lang === "en" ? "active" : ""}`}
                  onClick={() => {
                    onSelectLanguage("en");
                    setMobileMenuOpen(false);
                  }}
                >
                  EN
                </button>
                <span className="divider">/</span>
                <button
                  className={`lang-btn ${lang === "de" ? "active" : ""}`}
                  onClick={() => {
                    onSelectLanguage("de");
                    setMobileMenuOpen(false);
                  }}
                >
                  DE
                </button>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
};
