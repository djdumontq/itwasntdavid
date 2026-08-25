import React, { useState, useEffect, useCallback } from "react";
import { useTina } from "tinacms/dist/react";
import client from "../tina/__generated__/client";
import "./styles/impress.css";
import "./styles/fakechat.css";
import { NavigationToolbar } from "./components/NavigationToolbar";
import { SpatialCanvas, SlideData } from "./components/SpatialCanvas";

// Import Slide Pages fallback data (EN)
import welcomeEn from "../content/pages/en/welcome.json";
import strategyEn from "../content/pages/en/strategy.json";
import ideologyEn from "../content/pages/en/ideology.json";
import implementationEn from "../content/pages/en/implementation.json";
import contactEn from "../content/pages/en/contact.json";
import imprintEn from "../content/pages/en/imprint.json";

// Import Slide Pages fallback data (DE)
import welcomeDe from "../content/pages/de/welcome.json";
import strategyDe from "../content/pages/de/strategy.json";
import ideologyDe from "../content/pages/de/ideology.json";
import implementationDe from "../content/pages/de/implementation.json";
import contactDe from "../content/pages/de/contact.json";
import imprintDe from "../content/pages/de/imprint.json";

const defaultSlidesMap: Record<string, Record<string, SlideData>> = {
  en: {
    welcome: welcomeEn as SlideData,
    strategy: strategyEn as SlideData,
    ideology: ideologyEn as SlideData,
    implementation: implementationEn as SlideData,
    contact: contactEn as SlideData,
    imprint: imprintEn as SlideData,
  },
  de: {
    welcome: welcomeDe as SlideData,
    strategy: strategyDe as SlideData,
    ideology: ideologyDe as SlideData,
    implementation: implementationDe as SlideData,
    contact: contactDe as SlideData,
    imprint: imprintDe as SlideData,
  }
};

function LiveTinaBinder({
  activeId,
  tinaPayload,
  onSlideDataUpdate,
}: {
  activeId: string;
  tinaPayload: any;
  onSlideDataUpdate: (slide: SlideData) => void;
}) {
  const { data } = useTina({
    query: tinaPayload.query,
    variables: tinaPayload.variables,
    data: tinaPayload.data,
  });

  useEffect(() => {
    if (data?.pages) {
      onSlideDataUpdate({
        slideId: data.pages.slideId || activeId,
        title: data.pages.title || activeId,
        description: data.pages.description || "",
        spatial: data.pages.spatial,
        blocks: data.pages.blocks,
      });
    }
  }, [data, activeId, onSlideDataUpdate]);

  return null;
}

export default function App() {
  const [lang, setLang] = useState<"en" | "de">("en");
  const [activeId, setActiveId] = useState<string>("welcome");
  const [slidesMap, setSlidesMap] = useState<Record<string, SlideData>>(defaultSlidesMap.en);
  const [tinaPayloads, setTinaPayloads] = useState<Record<string, any>>({});

  // Sync state with active defaultSlidesMap when language changes
  useEffect(() => {
    setSlidesMap((prev) => {
      const nextMap = { ...defaultSlidesMap[lang] };
      // Keep any active dynamic Tina updates in the map
      Object.keys(nextMap).forEach(key => {
        const payloadKey = `${lang}_${key}`;
        if (tinaPayloads[payloadKey]?.data?.pages) {
          const tinaData = tinaPayloads[payloadKey].data.pages;
          nextMap[key] = {
            slideId: tinaData.slideId || key,
            title: tinaData.title || key,
            description: tinaData.description || "",
            spatial: tinaData.spatial,
            blocks: tinaData.blocks,
          };
        }
      });
      return nextMap;
    });
  }, [lang]);

  // Sync URL (supporting both pathnames for SEO landing pages and hash fragments for 3D transitions)
  useEffect(() => {
    const parseUrl = () => {
      let parsedLang: "en" | "de" = "en";
      let parsedId = "welcome";

      // 1. Check hash first: e.g. #/de/strategy or #/strategy
      const hash = window.location.hash.replace(/^#\/?/, "");
      if (hash) {
        if (hash.startsWith("de/")) {
          parsedLang = "de";
          parsedId = hash.substring(3) || "welcome";
        } else {
          parsedLang = "en";
          parsedId = hash || "welcome";
        }
      } else {
        // 2. Check pathname: e.g. /de/strategy or /strategy
        const pathParts = window.location.pathname.replace(/^\/|\/$/g, "").split("/");
        if (pathParts[0] === "de") {
          parsedLang = "de";
          parsedId = pathParts[1] || "welcome";
        } else if (pathParts[0] && pathParts[0] !== "index.html") {
          parsedLang = "en";
          parsedId = pathParts[0];
        }
      }

      const validSlides = ["welcome", "strategy", "ideology", "implementation", "contact", "imprint"];
      if (!validSlides.includes(parsedId)) {
        parsedId = "welcome";
      }

      return { parsedLang, parsedId };
    };

    const { parsedLang, parsedId } = parseUrl();
    setLang(parsedLang);
    setActiveId(parsedId);

    // Clean up address bar by converting path to standard hash representation
    const path = window.location.pathname.replace(/^\/|\/$/g, "");
    if (path && path !== "index.html") {
      const newHash = parsedLang === "en" ? `/#/${parsedId}` : `/#/de/${parsedId}`;
      window.history.replaceState(null, "", newHash);
    }

    const handleHashChange = () => {
      const { parsedLang: nextLang, parsedId: nextId } = parseUrl();
      setLang(nextLang);
      setActiveId(nextId);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Dynamic SEO Title and Meta Description updates based on active slide and language
  useEffect(() => {
    // 1. Format dynamic title
    const slideTitle = slidesMap[activeId]?.title || activeId;
    const cleanTitle = slideTitle.charAt(0).toUpperCase() + slideTitle.slice(1);
    document.title = `David Dumont | ${cleanTitle}`;

    // 2. Select optimized description based on language and active slide
    const descriptions: Record<string, Record<string, string>> = {
      en: {
        welcome: "Brand consultant helping leaders design honest strategies, write compelling stories, and deploy self-hosted digital infrastructure.",
        strategy: "Beyond the 'New Logo' Fallacy. Explore David Dumont's approach to strategic brand development, closing communication gaps, and emotional strategy.",
        ideology: "There is no cloud—just someone else's computer. Explore David Dumont's philosophy on digital sovereignty, data privacy, and hosting consulting.",
        implementation: "Tools I trust. How David Dumont builds clean, Git-backed systems with open-source tech like TinaCMS, NocoBase, and Docmost.",
        about: "Meet David Dumont. Learn about his career from traditional marketing agency lead to open-source self-hosting consultant.",
        contact: "Get in touch with David Dumont. Connect via email, LinkedIn, or schedule a consulting session.",
        imprint: "Legal imprint and contact details for David Dumont."
      },
      de: {
        welcome: "Markenberater, der Führungskräfte bei der Gestaltung ehrlicher Strategien, dem Schreiben überzeugender Geschichten und dem Aufbau selbstgehosteter digitaler Infrastrukturen unterstützt.",
        strategy: "Jenseits des Irrtums vom 'neuen Logo'. Entdecken Sie David Dumonts Ansatz zur strategischen Markenentwicklung, zum Schließen von Kommunikationslücken und zur emotionalen Strategie.",
        ideology: "Es gibt keine Cloud – nur den Computer von jemand anderem. Erfahren Sie mehr über David Dumonts Philosophie zu digitaler Souveränität, Datenschutz und Hosting-Beratung.",
        implementation: "Tools, denen ich vertraue. Wie David Dumont saubere, Git-gestützte Systeme mit Open-Source-Technologien wie TinaCMS, NocoBase und Docmost baut.",
        about: "Über David Dumont. Erfahren Sie mehr über seinen Werdegang vom klassischen Marketing-Agenturleiter zum selbstständigen Open-Source-Berater.",
        contact: "Kontaktieren Sie David Dumont. Schreiben Sie eine E-Mail, vernetzen Sie sich auf LinkedIn oder buchen Sie eine Beratungssitzung.",
        imprint: "Impressum und rechtliche Hinweise für David Dumont."
      }
    };

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    const currentDesc = descriptions[lang] || descriptions.en;
    metaDesc.setAttribute('content', slidesMap[activeId]?.description || currentDesc[activeId] || currentDesc.welcome);
  }, [activeId, slidesMap, lang]);

  // Fetch GraphQL payload for active slide and language without clearing payload state
  useEffect(() => {
    const filename = `${lang}/${activeId}.json`;
    client.queries
      .pages({ relativePath: filename })
      .then((res) => {
        setTinaPayloads((prev) => ({ ...prev, [`${lang}_${activeId}`]: res }));
      })
      .catch((err) => {
        console.warn(`TinaCMS query fallback for ${filename}:`, err);
      });
  }, [activeId, lang]);

  const handleSelectSlide = (id: string) => {
    setActiveId(id);
    window.location.hash = lang === "en" ? `#/${id}` : `#/de/${id}`;
  };

  const handleSelectLanguage = (newLang: "en" | "de") => {
    setLang(newLang);
    window.location.hash = newLang === "en" ? `#/${activeId}` : `#/de/${activeId}`;
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = Object.keys(slidesMap);
      if (["ArrowRight", "ArrowDown", "Space", "PageDown"].includes(e.key)) {
        e.preventDefault();
        const currentIndex = keys.indexOf(activeId);
        const nextIndex = (currentIndex + 1) % keys.length;
        handleSelectSlide(keys[nextIndex]);
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        const currentIndex = keys.indexOf(activeId);
        const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
        handleSelectSlide(keys[prevIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId, slidesMap]);

  const handleSlideUpdate = useCallback((updatedSlide: SlideData) => {
    setSlidesMap((prev) => ({
      ...prev,
      [updatedSlide.slideId]: updatedSlide,
    }));
  }, []);

  const currentPayloadKey = `${lang}_${activeId}`;
  const currentPayload = tinaPayloads[currentPayloadKey];

  const slides: SlideData[] = Object.keys(slidesMap).map((id) => slidesMap[id]);

  return (
    <div>
      {/* Live TinaCMS Binder only renders when valid payload exists (no empty query error) */}
      {currentPayload && (
        <LiveTinaBinder
          key={`${lang}_${activeId}`}
          activeId={activeId}
          tinaPayload={currentPayload}
          onSlideDataUpdate={handleSlideUpdate}
        />
      )}

      {/* Navigation & 3D Spatial Canvas stay mounted continuously for smooth 1000ms 3D glide transitions */}
      <NavigationToolbar
        slides={slides
          .filter((s) => s.slideId !== "imprint")
          .map((s) => ({ id: s.slideId, title: s.title || s.slideId }))}
        activeId={activeId}
        onSelectSlide={handleSelectSlide}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
      />

      <SpatialCanvas
        slides={slides}
        activeId={activeId}
        onNavigateSlide={handleSelectSlide}
      />
    </div>
  );
}
