import React, { useState, useEffect, useRef } from "react";

interface SlideNav {
  id: string;
  title: string;
}

interface NavigationToolbarProps {
  slides: SlideNav[];
  activeId: string;
  onSelectSlide: (id: string) => void;
}

export const NavigationToolbar: React.FC<NavigationToolbarProps> = ({
  slides,
  activeId,
  onSelectSlide,
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

    // Use setTimeout so the initial hamburger click event doesn't immediately close it
    const timer = setTimeout(() => {
      window.addEventListener("click", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div id="impress-toolbar" ref={toolbarRef}>
        <section id="header-above" className="top-nav">
          <a
            href="#welcome"
            className="brand-title"
            onClick={() => {
              onSelectSlide("welcome");
              setMobileMenuOpen(false);
            }}
          >
            David Dumont
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <i className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"} />
          </button>

          <ul className={`menu ${mobileMenuOpen ? "open" : ""}`}>
            {slides.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
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
          </ul>
        </section>
      </div>
    </>
  );
};
