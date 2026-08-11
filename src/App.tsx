import React, { useState, useEffect, useCallback } from "react";
import { useTina } from "tinacms/dist/react";
import client from "../tina/__generated__/client";
import "./styles/impress.css";
import "./styles/fakechat.css";
import { NavigationToolbar } from "./components/NavigationToolbar";
import { SpatialCanvas, SlideData } from "./components/SpatialCanvas";

// Import Slide Pages fallback data
import welcomePage from "../content/pages/welcome.json";
import strategyPage from "../content/pages/strategy.json";
import ideologyPage from "../content/pages/ideology.json";
import implementationPage from "../content/pages/implementation.json";
import contactPage from "../content/pages/contact.json";
import imprintPage from "../content/pages/imprint.json";

const defaultSlidesMap: Record<string, SlideData> = {
  welcome: welcomePage as SlideData,
  strategy: strategyPage as SlideData,
  ideology: ideologyPage as SlideData,
  implementation: implementationPage as SlideData,
  contact: contactPage as SlideData,
  imprint: imprintPage as SlideData,
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
        spatial: data.pages.spatial,
        blocks: data.pages.blocks,
      });
    }
  }, [data, activeId, onSlideDataUpdate]);

  return null;
}

export default function App() {
  const [activeId, setActiveId] = useState<string>("welcome");
  const [slidesMap, setSlidesMap] = useState<Record<string, SlideData>>(defaultSlidesMap);
  const [tinaPayloads, setTinaPayloads] = useState<Record<string, any>>({});

  // Sync hash fragment (#/welcome -> welcome)
  useEffect(() => {
    const getHashId = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      return hash || "welcome";
    };

    setActiveId(getHashId());

    const handleHashChange = () => {
      setActiveId(getHashId());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Dynamic SEO Title and Meta Description updates based on active slide
  useEffect(() => {
    // 1. Format dynamic title
    const slideTitle = slidesMap[activeId]?.title || activeId;
    const cleanTitle = slideTitle.charAt(0).toUpperCase() + slideTitle.slice(1);
    document.title = `David Dumont | ${cleanTitle}`;

    // 2. Select optimized description
    const descriptions: Record<string, string> = {
      welcome: "Brand consultant helping leaders design honest strategies, write compelling stories, and deploy self-hosted digital infrastructure.",
      strategy: "Beyond the 'New Logo' Fallacy. Explore David Dumont's approach to strategic brand development, closing communication gaps, and emotional strategy.",
      ideology: "There is no cloud—just someone else's computer. Explore David Dumont's philosophy on digital sovereignty, data privacy, and hosting consulting.",
      implementation: "Tools I trust. How David Dumont builds clean, Git-backed systems with open-source tech like TinaCMS, NocoBase, and Docmost.",
      about: "Meet David Dumont. Learn about his career from traditional marketing agency lead to open-source self-hosting consultant.",
      contact: "Get in touch with David Dumont. Connect via email, LinkedIn, or schedule a consulting session.",
      imprint: "Legal imprint and contact details for David Dumont."
    };

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descriptions[activeId] || descriptions.welcome);
  }, [activeId, slidesMap]);

  // Fetch GraphQL payload for active slide without clearing payload state
  useEffect(() => {
    const filename = `${activeId}.json`;
    client.queries
      .pages({ relativePath: filename })
      .then((res) => {
        setTinaPayloads((prev) => ({ ...prev, [activeId]: res }));
      })
      .catch((err) => {
        console.warn(`TinaCMS query fallback for ${filename}:`, err);
      });
  }, [activeId]);

  const handleSelectSlide = (id: string) => {
    setActiveId(id);
    window.location.hash = `#/${id}`;
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

  const currentPayload = tinaPayloads[activeId];

  const slides: SlideData[] = Object.keys(slidesMap).map((id) => slidesMap[id]);

  return (
    <div>
      {/* Live TinaCMS Binder only renders when valid payload exists (no empty query error) */}
      {currentPayload && (
        <LiveTinaBinder
          key={activeId}
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
      />

      <SpatialCanvas
        slides={slides}
        activeId={activeId}
        onNavigateSlide={handleSelectSlide}
      />
    </div>
  );
}
