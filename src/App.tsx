import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTina } from "tinacms/dist/react";
import client from "../tina/__generated__/client";
import "./styles/impress.css";
import "./styles/fakechat.css";
import { NavigationToolbar } from "./components/NavigationToolbar";
import { SpatialCanvas, SlideData } from "./components/SpatialCanvas";
import { getPostsList, loadPostMarkdown, BlogPostFull, BlogPostMeta } from "./data/posts";

// Import Slide Pages fallback data (EN)
import welcomeEn from "../content/pages/en/welcome.json";
import strategyEn from "../content/pages/en/strategy.json";
import ideologyEn from "../content/pages/en/ideology.json";
import implementationEn from "../content/pages/en/implementation.json";
import blogEn from "../content/pages/en/blog.json";
import contactEn from "../content/pages/en/contact.json";
import imprintEn from "../content/pages/en/imprint.json";

// Import Slide Pages fallback data (DE)
import welcomeDe from "../content/pages/de/welcome.json";
import strategyDe from "../content/pages/de/strategy.json";
import ideologyDe from "../content/pages/de/ideology.json";
import implementationDe from "../content/pages/de/implementation.json";
import blogDe from "../content/pages/de/blog.json";
import contactDe from "../content/pages/de/contact.json";
import imprintDe from "../content/pages/de/imprint.json";

const defaultSlidesMap: Record<string, Record<string, SlideData>> = {
  en: {
    welcome: welcomeEn as SlideData,
    strategy: strategyEn as SlideData,
    ideology: ideologyEn as SlideData,
    implementation: implementationEn as SlideData,
    blog: blogEn as SlideData,
    contact: contactEn as SlideData,
    imprint: imprintEn as SlideData,
  },
  de: {
    welcome: welcomeDe as SlideData,
    strategy: strategyDe as SlideData,
    ideology: ideologyDe as SlideData,
    implementation: implementationDe as SlideData,
    blog: blogDe as SlideData,
    contact: contactDe as SlideData,
    imprint: imprintDe as SlideData,
  },
};

// Universal route parser matching URL hashes, paths, and TinaCMS document IDs
export function parseRoute(hashOrPath: string): {
  lang: "en" | "de";
  slideId: string;
  articleSlug: string | null;
} {
  let raw = (hashOrPath || "")
    .replace(/^[#/]+/, "")
    .replace(/^content\/(pages|posts)\//, "")
    .replace(/\.(json|md)$/, "");

  if (!raw || raw === "index.html" || raw.startsWith("admin")) {
    return { lang: "en", slideId: "welcome", articleSlug: null };
  }

  let lang: "en" | "de" = "en";
  const segments = raw.split("/").filter(Boolean);

  if (segments[0] === "de") {
    lang = "de";
    segments.shift();
  } else if (segments[0] === "en") {
    lang = "en";
    segments.shift();
  }

  const first = segments[0] || "welcome";

  if (first === "blog" || first === "posts") {
    segments.shift();
    if (segments[0] === "de") {
      lang = "de";
      segments.shift();
    } else if (segments[0] === "en") {
      lang = "en";
      segments.shift();
    }
    const slug = segments[0] || null;
    if (slug) {
      return { lang, slideId: slug, articleSlug: slug };
    }
    return { lang, slideId: "blog", articleSlug: null };
  }

  const validSlides = ["welcome", "strategy", "ideology", "implementation", "blog", "contact", "imprint"];
  if (validSlides.includes(first)) {
    return { lang, slideId: first, articleSlug: null };
  }

  // If not a standard slide, treat as an article slug directly
  return { lang, slideId: first, articleSlug: first };
}

function LiveTinaBinder({
  activeId,
  activeArticleSlug,
  tinaPayload,
  onSlideDataUpdate,
  onArticleDataUpdate,
}: {
  activeId: string;
  activeArticleSlug: string | null;
  tinaPayload: any;
  onSlideDataUpdate: (slide: SlideData) => void;
  onArticleDataUpdate: (post: BlogPostFull) => void;
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
    } else if (data?.posts && activeArticleSlug) {
      onArticleDataUpdate({
        slug: data.posts.slug || activeArticleSlug,
        title: data.posts.title || "",
        date: data.posts.date ? data.posts.date.split("T")[0] : "",
        description: data.posts.description || "",
        image: data.posts.image || "",
        tags: data.posts.tags || [],
        featured: data.posts.featured || false,
        readingTime: data.posts.readingTime || "",
        lang: data.posts._sys?.breadcrumbs?.includes("de") ? "de" : "en",
        body: data.posts.body,
      });
    }
  }, [data, activeId, activeArticleSlug, onSlideDataUpdate, onArticleDataUpdate]);

  return null;
}

export default function App() {
  const [lang, setLang] = useState<"en" | "de">("en");
  const [activeId, setActiveId] = useState<string>("welcome");
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<BlogPostFull | null>(null);
  const [slidesMap, setSlidesMap] = useState<Record<string, SlideData>>(defaultSlidesMap.en);
  const [tinaPayloads, setTinaPayloads] = useState<Record<string, any>>({});
  const lastParsedRoute = useRef<string>("");

  const postsList: BlogPostMeta[] = getPostsList(lang);

  // Sync state with active defaultSlidesMap when language changes
  useEffect(() => {
    setSlidesMap((prev) => {
      const nextMap = { ...defaultSlidesMap[lang] };
      // Keep any active dynamic Tina updates in the map
      Object.keys(nextMap).forEach((key) => {
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

  // Two-Way Sync Controller: Synchronizes TinaCMS sidebar collection navigation with 3D impress presentation
  useEffect(() => {
    const syncFromUrl = () => {
      let raw = window.location.hash;
      if (!raw || raw === "#" || raw === "#/") {
        raw = window.location.pathname;
      }

      if (raw === lastParsedRoute.current) return;
      lastParsedRoute.current = raw;

      const { lang: nextLang, slideId: nextId, articleSlug: nextSlug } = parseRoute(raw);
      setLang(nextLang);
      setActiveId(nextId);
      setActiveArticleSlug(nextSlug);

      // Clean address bar in top-level browser (do not modify in iframe to prevent TinaCMS router loop)
      const isInIframe = typeof window !== "undefined" && window.self !== window.top;
      if (!isInIframe && window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
        const articleSuffix = nextSlug ? `/${nextSlug}` : "";
        const targetPath = nextSlug ? "blog" : nextId;
        const newHash = nextLang === "en" ? `/#/${targetPath}${articleSuffix}` : `/#/de/${targetPath}${articleSuffix}`;
        window.history.replaceState(null, "", newHash);
      }
    };

    // Initial parse
    syncFromUrl();

    // Event listeners for URL navigation
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);

    // Message listener for TinaCMS parent window events
    const handleMessage = (e: MessageEvent) => {
      try {
        if (!e.data) return;
        const msg = e.data;
        const docPath =
          typeof msg === "string"
            ? msg
            : msg.id || msg.path || msg.document || msg.relativePath;

        if (typeof docPath === "string" && (docPath.includes("content/pages") || docPath.includes("content/posts"))) {
          const { lang: nextLang, slideId: nextId, articleSlug: nextSlug } = parseRoute(docPath);
          setLang(nextLang);
          setActiveId(nextId);
          setActiveArticleSlug(nextSlug);
        }
      } catch (err) {
        // Ignore non-Tina messages
      }
    };

    window.addEventListener("message", handleMessage);

    // Polling interval inside iframe to guarantee sub-200ms sync if hash change event is missed
    const isInIframe = typeof window !== "undefined" && window.self !== window.top;
    let pollTimer: any = null;
    if (isInIframe) {
      pollTimer = setInterval(syncFromUrl, 150);
    }

    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("message", handleMessage);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // Synchronously initialize and lazy-load article markdown on demand
  useEffect(() => {
    if (!activeArticleSlug) {
      setActiveArticle(null);
      return;
    }

    // Synchronously provide initial article data to guarantee ArticleSlide renders instantly without blank frame
    const metaList = getPostsList(lang);
    const initialMeta = metaList.find((p) => p.slug === activeArticleSlug) || {
      slug: activeArticleSlug,
      title: activeArticleSlug.replace(/-/g, " "),
      date: new Date().toISOString().split("T")[0],
      description: "",
      lang,
    };

    setActiveArticle((prev) => {
      if (prev && prev.slug === activeArticleSlug) return prev;
      return {
        ...initialMeta,
        body: `## ${initialMeta.title}\n\n${initialMeta.description || ""}`,
      };
    });

    let isMounted = true;
    loadPostMarkdown(lang, activeArticleSlug).then((post) => {
      if (isMounted && post) {
        setActiveArticle((prev) => ({
          ...post,
          body: prev && typeof prev.body === "object" ? prev.body : post.body,
        }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeArticleSlug, lang]);

  // Dynamic SEO Title and Meta Description updates based on active slide/article and language
  useEffect(() => {
    if (activeArticle) {
      document.title = `David Dumont | ${activeArticle.title}`;
    } else {
      const slideTitle = slidesMap[activeId]?.title || activeId;
      const cleanTitle = slideTitle.charAt(0).toUpperCase() + slideTitle.slice(1);
      document.title = `David Dumont | ${cleanTitle}`;
    }

    const descriptions: Record<string, Record<string, string>> = {
      en: {
        welcome: "Brand consultant helping leaders design honest strategies, write compelling stories, and deploy self-hosted digital infrastructure.",
        strategy: "Beyond the 'New Logo' Fallacy. Explore David Dumont's approach to strategic brand development, closing communication gaps, and emotional strategy.",
        ideology: "There is no cloud—just someone else's computer. Explore David Dumont's philosophy on digital sovereignty, data privacy, and hosting consulting.",
        implementation: "Tools I trust. How David Dumont builds clean, Git-backed systems with open-source tech like TinaCMS, NocoBase, and Docmost.",
        blog: "Articles, thoughts, and field notes by David Dumont on brand storytelling, open-source systems, and digital sovereignty.",
        about: "Meet David Dumont. Learn about his career from traditional marketing agency lead to open-source self-hosting consultant.",
        contact: "Get in touch with David Dumont. Connect via email, LinkedIn, or schedule a consulting session.",
        imprint: "Legal imprint and contact details for David Dumont.",
      },
      de: {
        welcome: "Markenberater, der Führungskräfte bei der Gestaltung ehrlicher Strategien, dem Schreiben überzeugender Geschichten und dem Aufbau selbstgehosteter digitaler Infrastrukturen unterstützt.",
        strategy: "Jenseits des Irrtums vom 'neuen Logo'. Entdecken Sie David Dumonts Ansatz zur strategischen Markenentwicklung, zum Schließen von Kommunikationslücken und zur emotionalen Strategie.",
        ideology: "Es gibt keine Cloud – nur den Computer von jemand anderem. Erfahren Sie mehr über David Dumonts Philosophie zu digitaler Souveränität, Datenschutz und Hosting-Beratung.",
        implementation: "Tools, denen ich vertraue. Wie David Dumont saubere, Git-gestützte Systeme mit Open-Source-Technologien wie TinaCMS, NocoBase und Docmost baut.",
        blog: "Artikel, Gedanken und Notizen von David Dumont über Marken-Storytelling, Open-Source-Systeme und digitale Souveränität.",
        about: "Über David Dumont. Erfahren Sie mehr über seinen Werdegang vom klassischen Marketing-Agenturleiter zum selbstständigen Open-Source-Berater.",
        contact: "Kontaktieren Sie David Dumont. Schreiben Sie eine E-Mail, vernetzen Sie sich auf LinkedIn oder buchen Sie eine Beratungssitzung.",
        imprint: "Impressum und rechtliche Hinweise für David Dumont.",
      },
    };

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }

    if (activeArticle) {
      metaDesc.setAttribute("content", activeArticle.description);
    } else {
      const currentDesc = descriptions[lang] || descriptions.en;
      metaDesc.setAttribute(
        "content",
        slidesMap[activeId]?.description || currentDesc[activeId] || currentDesc.welcome
      );
    }
  }, [activeId, activeArticle, slidesMap, lang]);

  // Fetch GraphQL payload for active slide OR active post and language without clearing payload state (with caching)
  useEffect(() => {
    if (activeArticleSlug) {
      const payloadKey = `${lang}_post_${activeArticleSlug}`;
      if (tinaPayloads[payloadKey]) {
        return;
      }
      const filename = `${lang}/${activeArticleSlug}.md`;
      client.queries
        .posts({ relativePath: filename })
        .then((res) => {
          setTinaPayloads((prev) => ({ ...prev, [payloadKey]: res }));
        })
        .catch((err) => {
          console.warn(`TinaCMS post query fallback for ${filename}:`, err);
        });
    } else {
      const payloadKey = `${lang}_${activeId}`;
      if (tinaPayloads[payloadKey]) {
        return;
      }
      const filename = `${lang}/${activeId}.json`;
      client.queries
        .pages({ relativePath: filename })
        .then((res) => {
          setTinaPayloads((prev) => ({ ...prev, [payloadKey]: res }));
        })
        .catch((err) => {
          console.warn(`TinaCMS page query fallback for ${filename}:`, err);
        });
    }
  }, [activeId, activeArticleSlug, lang, tinaPayloads]);

  // User interactions in the presentation (Canvas ➔ Sidebar)
  const handleSelectSlide = (id: string) => {
    setActiveId(id);
    setActiveArticleSlug(null);
    window.location.hash = lang === "en" ? `#/${id}` : `#/de/${id}`;
  };

  const handleSelectArticle = (slug: string) => {
    setActiveId(slug);
    setActiveArticleSlug(slug);
    window.location.hash = lang === "en" ? `#/blog/${slug}` : `#/de/blog/${slug}`;
  };

  const handleBackToBlogHub = () => {
    setActiveId("blog");
    setActiveArticleSlug(null);
    setActiveArticle(null);
    window.location.hash = lang === "en" ? `#/blog` : `#/de/blog`;
  };

  const handleSelectLanguage = (newLang: "en" | "de") => {
    setLang(newLang);
    if (activeArticleSlug) {
      window.location.hash = newLang === "en" ? `#/blog` : `#/de/blog`;
    } else {
      window.location.hash = newLang === "en" ? `#/${activeId}` : `#/de/${activeId}`;
    }
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = Object.keys(slidesMap);
      if (["ArrowRight", "ArrowDown", "Space", "PageDown"].includes(e.key)) {
        e.preventDefault();
        const currentIndex = keys.indexOf(activeId);
        if (currentIndex > -1) {
          const nextIndex = (currentIndex + 1) % keys.length;
          handleSelectSlide(keys[nextIndex]);
        }
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        const currentIndex = keys.indexOf(activeId);
        if (currentIndex > -1) {
          const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
          handleSelectSlide(keys[prevIndex]);
        }
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

  const handleArticleUpdate = useCallback((updatedPost: BlogPostFull) => {
    setActiveArticle(updatedPost);
  }, []);

  const currentPayloadKey = activeArticleSlug
    ? `${lang}_post_${activeArticleSlug}`
    : `${lang}_${activeId}`;
  const currentPayload = tinaPayloads[currentPayloadKey];

  // Base 7 standard presentation slide pages
  const baseSlides: SlideData[] = Object.keys(slidesMap).map((id) => slidesMap[id]);

  // Spatial blog article slides positioned in 3D depth directly behind the blog listing hub (z: 10000 -> z: 7500)
  const articleSlides: SlideData[] = postsList.map((p, idx) => {
    const isCurrentActive = activeArticleSlug === p.slug;
    const postData: BlogPostFull = isCurrentActive && activeArticle
      ? activeArticle
      : {
          ...p,
          body: `## ${p.title}\n\n${p.description}`,
        };

    return {
      slideId: p.slug,
      title: p.title,
      description: p.description,
      slideType: "blog_article",
      spatial: {
        x: -2400 + idx * 1500,
        y: -2000,
        z: 7500, // Zoomed in 2500px behind the blog hub card!
        scale: 1,
      },
      postData,
    };
  });

  const allCanvasSlides: SlideData[] = [...baseSlides, ...articleSlides];

  return (
    <div>
      {/* Live TinaCMS Binder only renders when valid payload exists (no empty query error) */}
      {currentPayload && (
        <LiveTinaBinder
          key={currentPayloadKey}
          activeId={activeId}
          activeArticleSlug={activeArticleSlug}
          tinaPayload={currentPayload}
          onSlideDataUpdate={handleSlideUpdate}
          onArticleDataUpdate={handleArticleUpdate}
        />
      )}

      {/* Main Presentation Toolbar: Slides & Language switch stay seamlessly mounted */}
      <NavigationToolbar
        slides={baseSlides
          .filter((s) => s.slideId !== "imprint")
          .map((s) => ({ id: s.slideId, title: s.title || s.slideId }))}
        activeId={activeArticleSlug ? "blog" : activeId}
        onSelectSlide={handleSelectSlide}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* All Slides and Blog Articles exist on the same 3D Spatial Canvas */}
      <SpatialCanvas
        slides={allCanvasSlides}
        activeId={activeId}
        onNavigateSlide={handleSelectSlide}
        posts={postsList}
        lang={lang}
        onSelectArticle={handleSelectArticle}
        onBackToBlog={handleBackToBlogHub}
      />
    </div>
  );
}
