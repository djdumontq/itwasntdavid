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

// Synchronously import all markdown files eager at build/dev time
const rawPostsEn = import.meta.glob("../../content/posts/en/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const rawPostsDe = import.meta.glob("../../content/posts/de/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function extractPostsFromGlob(
  globMap: Record<string, string>,
  lang: "en" | "de"
): BlogPostMeta[] {
  const posts: BlogPostMeta[] = [];

  Object.entries(globMap).forEach(([filePath, rawContent]) => {
    const filename = filePath.split("/").pop()?.replace(/\.md$/, "") || "";
    const { meta } = parseFrontmatter(rawContent);

    posts.push({
      slug: meta.slug || filename,
      title: meta.title || filename,
      date: meta.date ? meta.date.split("T")[0] : new Date().toISOString().split("T")[0],
      description: meta.description || "",
      image: meta.image || "",
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      featured: !!meta.featured,
      readingTime: meta.readingTime || (lang === "de" ? "5 Min. Lesezeit" : "5 min read"),
      lang,
    });
  });

  // Sort newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const postsMetaEn: BlogPostMeta[] = extractPostsFromGlob(rawPostsEn, "en");
export const postsMetaDe: BlogPostMeta[] = extractPostsFromGlob(rawPostsDe, "de");

export const getPostsList = (lang: "en" | "de"): BlogPostMeta[] => {
  return lang === "de" ? extractPostsFromGlob(rawPostsDe, "de") : extractPostsFromGlob(rawPostsEn, "en");
};

// On-demand loader for full post markdown
export const loadPostMarkdown = async (
  lang: "en" | "de",
  slug: string
): Promise<BlogPostFull | null> => {
  try {
    const globMap = lang === "de" ? rawPostsDe : rawPostsEn;
    const matchingKey = Object.keys(globMap).find(
      (k) => k.endsWith(`/${lang}/${slug}.md`) || k.endsWith(`/${slug}.md`)
    );

    if (matchingKey && globMap[matchingKey]) {
      const rawContent = globMap[matchingKey];
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
        readingTime: meta.readingTime || "5 min read",
        lang,
      };

      return {
        ...matchedMeta,
        title: meta.title || matchedMeta.title,
        description: meta.description || matchedMeta.description,
        image: meta.image || matchedMeta.image,
        tags: Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : matchedMeta.tags,
        date: meta.date ? meta.date.split("T")[0] : matchedMeta.date,
        featured: typeof meta.featured === "boolean" ? meta.featured : matchedMeta.featured,
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
