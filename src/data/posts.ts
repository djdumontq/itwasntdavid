export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
  readingTime?: string;
  lang: "en" | "de";
}

export interface BlogPostFull extends BlogPostMeta {
  body: any; // string markdown or TinaCMS rich-text AST
}

// Vite glob imports for dynamic, on-demand loading of all markdown posts
const allPostModules = {
  ...import.meta.glob("../../content/posts/en/*.md", {
    query: "?raw",
    import: "default",
  }),
  ...import.meta.glob("../../content/posts/de/*.md", {
    query: "?raw",
    import: "default",
  }),
};

// Seed metadata for English posts (lightweight index for 3D canvas card grid)
export const postsMetaEn: BlogPostMeta[] = [
  {
    slug: "why-digital-sovereignty-matters",
    title: "Why Digital Sovereignty is the Best Brand Strategy",
    date: "2026-08-15",
    description: "Most companies outsource their entire digital infrastructure to foreign cloud monopolies. Here is why taking ownership of your stack makes your brand resilient, trustworthy, and un-cancellable.",
    image: "/uploads/no-cloud.png",
    tags: ["Digital Sovereignty", "Open Source", "Strategy"],
    featured: true,
    readingTime: "4 min read",
    lang: "en",
  },
  {
    slug: "git-backed-cms-tinacms",
    title: "Git-Backed CMS: Why We Abandoned Bloated Databases",
    date: "2026-08-28",
    description: "Traditional CMS platforms lock your content into complex, vulnerable SQL databases. Git-backed architecture with TinaCMS gives you visual editing with plain-text version control.",
    image: "/uploads/tinacms-logo.png",
    tags: ["TinaCMS", "Websites", "Open Source"],
    featured: false,
    readingTime: "5 min read",
    lang: "en",
  },
];

// Seed metadata for German posts (lightweight index for 3D canvas card grid)
export const postsMetaDe: BlogPostMeta[] = [
  {
    slug: "warum-digitale-souveraenitaet",
    title: "Warum digitale Souveränität die beste Markenstrategie ist",
    date: "2026-08-15",
    description: "Die meisten Unternehmen lagern ihre gesamte digitale Infrastruktur an ausländische Cloud-Monopole aus. Warum die Kontrolle über den eigenen Stack Ihre Marke krisenfest, vertrauenswürdig und unabhängig macht.",
    image: "/uploads/no-cloud.png",
    tags: ["Digitale Souveränität", "Open Source", "Strategie"],
    featured: true,
    readingTime: "4 Min. Lesezeit",
    lang: "de",
  },
  {
    slug: "git-gestuetzte-cms-tinacms",
    title: "Git-gestützte CMS: Warum wir überladene Datenbanken hinter uns lassen",
    date: "2026-08-28",
    description: "Klassische CMS sperren Inhalte in komplexe, wartungsintensive SQL-Datenbanken ein. Die Git-gestützte Architektur mit TinaCMS vereint visuelle Bearbeitung mit versionierten Klartextdateien.",
    image: "/uploads/tinacms-logo.png",
    tags: ["TinaCMS", "Websites", "Open Source"],
    featured: false,
    readingTime: "5 Min. Lesezeit",
    lang: "de",
  },
];

export const getPostsList = (lang: "en" | "de"): BlogPostMeta[] => {
  return lang === "de" ? postsMetaDe : postsMetaEn;
};

// Helper to parse markdown frontmatter
export function parseFrontmatter(rawContent: string): { meta: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  if (!match) return { meta: {}, body: rawContent };

  const yamlBlock = match[1];
  const body = match[2];
  const meta: Record<string, any> = {};

  let currentKey: string | null = null;
  yamlBlock.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (trimmed.startsWith("- ") && currentKey) {
      if (!Array.isArray(meta[currentKey])) {
        meta[currentKey] = [];
      }
      meta[currentKey].push(trimmed.slice(2).replace(/^["']|["']$/g, ""));
      return;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val === "true") val = true as any;
      if (val === "false") val = false as any;
      currentKey = key;
      meta[key] = val;
    }
  });

  return { meta, body };
}

// On-demand dynamic loader for raw post markdown files
export const loadPostMarkdown = async (
  lang: "en" | "de",
  slug: string
): Promise<BlogPostFull | null> => {
  try {
    const matchingKey = Object.keys(allPostModules).find(
      (k) => k.endsWith(`/${lang}/${slug}.md`) || k.endsWith(`/${slug}.md`)
    );

    if (matchingKey && typeof allPostModules[matchingKey] === "function") {
      const rawContent = (await allPostModules[matchingKey]()) as string;
      const { meta, body } = parseFrontmatter(rawContent);

      const list = getPostsList(lang);
      const matchedMeta = list.find((p) => p.slug === slug) || {
        slug,
        title: meta.title || slug.replace(/-/g, " "),
        date: meta.date ? meta.date.split("T")[0] : "",
        description: meta.description || "",
        image: meta.image || "",
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        featured: !!meta.featured,
        readingTime: meta.readingTime || "4 min read",
        lang,
      };

      return {
        ...matchedMeta,
        title: meta.title || matchedMeta.title,
        description: meta.description || matchedMeta.description,
        image: meta.image || matchedMeta.image,
        tags: Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : matchedMeta.tags,
        date: meta.date ? meta.date.split("T")[0] : matchedMeta.date,
        body,
      };
    }

    // Fallback if file not in glob
    const list = getPostsList(lang);
    const fallbackMeta = list.find((p) => p.slug === slug);
    if (fallbackMeta) {
      return {
        ...fallbackMeta,
        body: `## ${fallbackMeta.title}\n\n${fallbackMeta.description}`,
      };
    }

    return null;
  } catch (err) {
    console.warn(`Could not load markdown for post ${lang}/${slug}:`, err);
    return null;
  }
};
