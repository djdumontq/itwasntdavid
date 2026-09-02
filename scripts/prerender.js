const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const PAGES_DIR = path.join(__dirname, '../content/pages');
const POSTS_DIR = path.join(__dirname, '../content/posts');

// Fallback meta descriptions matching App.tsx
const descriptions = {
  en: {
    welcome: "Brand consultant helping leaders design honest strategies, write compelling stories, and deploy self-hosted digital infrastructure.",
    strategy: "Beyond the 'New Logo' Fallacy. Explore David Dumont's approach to strategic brand development, closing communication gaps, and emotional strategy.",
    ideology: "There is no cloud—just someone else's computer. Explore David Dumont's philosophy on digital sovereignty, data privacy, and hosting consulting.",
    implementation: "Tools I trust. How David Dumont builds clean, Git-backed systems with open-source tech like TinaCMS, NocoBase, and Docmost.",
    blog: "Articles, insights, and field notes by David Dumont on brand storytelling, open-source systems, and digital sovereignty.",
    about: "Meet David Dumont. Learn about his career from traditional marketing agency lead to open-source self-hosting consultant.",
    contact: "Get in touch with David Dumont. Connect via email, LinkedIn, or schedule a consulting session.",
    imprint: "Legal imprint and contact details for David Dumont."
  },
  de: {
    welcome: "Markenberater, der Führungskräfte bei der Gestaltung ehrlicher Strategien, dem Schreiben überzeugender Geschichten und dem Aufbau selbstgehosteter digitaler Infrastrukturen unterstützt.",
    strategy: "Jenseits des Irrtums vom 'neuen Logo'. Entdecken Sie David Dumonts Ansatz zur strategischen Markenentwicklung, zum Schließen von Kommunikationslücken und zur emotionalen Strategie.",
    ideology: "Es gibt keine Cloud – nur den Computer von jemand anderem. Erfahren Sie mehr über David Dumonts Philosophie zu digitaler Souveränität, Datenschutz und Hosting-Beratung.",
    implementation: "Tools, denen ich vertraue. Wie David Dumont saubere, Git-gestützte Systeme mit Open-Source-Technologien wie TinaCMS, NocoBase und Docmost baut.",
    blog: "Artikel, Gedanken und Notizen von David Dumont über Marken-Storytelling, Open-Source-Systeme und digitale Souveränität.",
    about: "Über David Dumont. Erfahren Sie mehr über seinen Werdegang vom klassischen Marketing-Agenturleiter zum selbstständigen Open-Source-Berater.",
    contact: "Kontaktieren Sie David Dumont. Schreiben Sie eine E-Mail, vernetzen Sie sich auf LinkedIn oder buchen Sie eine Beratungssitzung.",
    imprint: "Impressum und rechtliche Hinweise für David Dumont."
  }
};

const BASE_URL = "https://itwasntdavid.de";

function parseMarkdownFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const yamlBlock = match[1];
  const body = match[2];
  const meta = {};

  let currentKey = null;
  yamlBlock.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    if (trimmed.startsWith('- ') && currentKey) {
      if (!Array.isArray(meta[currentKey])) {
        meta[currentKey] = [];
      }
      meta[currentKey].push(trimmed.slice(2).replace(/^["']|["']$/g, ''));
      return;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      currentKey = key;
      if (val !== '') {
        meta[key] = val;
      }
    }
  });

  return { meta, body };
}

function generateRssFeed(posts, lang) {
  const isDe = lang === 'de';
  const feedTitle = isDe ? 'David Dumont — Notizen & Gedanken' : 'David Dumont — Field Notes & Insights';
  const feedDesc = isDe 
    ? 'Artikel und Gedanken von David Dumont über Marken-Storytelling, digitale Souveränität und Open-Source-Infrastruktur.' 
    : 'Articles and insights by David Dumont on brand storytelling, digital sovereignty, and resilient open-source tools.';
  const feedUrl = isDe ? `${BASE_URL}/de/rss.xml` : `${BASE_URL}/rss.xml`;
  const siteUrl = isDe ? `${BASE_URL}/de/blog` : `${BASE_URL}/blog`;

  const items = posts.map(post => {
    const postUrl = isDe ? `${BASE_URL}/de/blog/${post.slug}` : `${BASE_URL}/blog/${post.slug}`;
    const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.description}]]></description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${feedTitle}</title>
    <link>${siteUrl}</link>
    <description>${feedDesc}</description>
    <language>${lang}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

function generateSitemap(sitemapUrls) {
  const items = sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.8'}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`;
}

function prerender() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error("Template index.html not found in dist/. Please run build first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const languages = ['en', 'de'];
  const sitemapUrls = [];

  languages.forEach(lang => {
    // 1. Prerender Slide Pages
    const langPagesDir = path.join(PAGES_DIR, lang);
    if (fs.existsSync(langPagesDir)) {
      const pageFiles = fs.readdirSync(langPagesDir).filter(file => file.endsWith('.json'));

      pageFiles.forEach(file => {
        const slideId = path.basename(file, '.json');
        const jsonPath = path.join(langPagesDir, file);
        let title = slideId.charAt(0).toUpperCase() + slideId.slice(1);
        const descList = descriptions[lang] || descriptions.en;
        let desc = descList[slideId] || descList.welcome;

        try {
          const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          if (data.title) title = data.title;
          if (data.description) desc = data.description;
        } catch (e) {
          console.warn(`Could not read metadata from ${jsonPath}, using fallback.`);
        }

        const fullTitle = `David Dumont | ${title}`;

        let pageUrlPath = lang === 'en' ? slideId : `de/${slideId}`;
        if (slideId === 'welcome') {
          pageUrlPath = lang === 'en' ? '' : 'de';
        }
        const pageUrl = pageUrlPath ? `${BASE_URL}/${pageUrlPath}` : `${BASE_URL}/`;

        // Register in sitemap
        sitemapUrls.push({
          loc: pageUrl,
          priority: slideId === 'welcome' ? (lang === 'en' ? '1.0' : '0.9') : (slideId === 'imprint' ? '0.3' : '0.8'),
          changefreq: slideId === 'welcome' ? 'daily' : (slideId === 'imprint' ? 'monthly' : 'weekly'),
        });

        let html = template;
        html = html.replace('<html lang="en">', `<html lang="${lang}">`);
        html = html.replace(/<title>[^<]*<\/title>/g, `<title>${fullTitle}</title>`);
        html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, `<meta name="description" content="${desc}" />`);
        html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/g, `<link rel="canonical" href="${pageUrl}" />`);
        html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/g, `<meta property="og:url" content="${pageUrl}" />`);
        html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${fullTitle}" />`);
        html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${desc}" />`);
        html = html.replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>/g, `<meta property="twitter:url" content="${pageUrl}" />`);
        html = html.replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/g, `<meta property="twitter:title" content="${fullTitle}" />`);
        html = html.replace(/<meta property="twitter:description" content="[^"]*"\s*\/?>/g, `<meta property="twitter:description" content="${desc}" />`);

        const outputDir = lang === 'en' 
          ? path.join(DIST_DIR, slideId)
          : path.join(DIST_DIR, 'de', slideId);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
        console.log(`Prerendered [${lang}]: ${slideId} -> ${outputDir}/index.html`);

        if (slideId === 'welcome') {
          if (lang === 'en') {
            fs.writeFileSync(templatePath, html, 'utf8');
          } else if (lang === 'de') {
            const deRootDir = path.join(DIST_DIR, 'de');
            if (!fs.existsSync(deRootDir)) {
              fs.mkdirSync(deRootDir, { recursive: true });
            }
            fs.writeFileSync(path.join(deRootDir, 'index.html'), html, 'utf8');
          }
        }
      });
    }

    // 2. Prerender Blog Articles
    const langPostsDir = path.join(POSTS_DIR, lang);
    const langPosts = [];

    if (fs.existsSync(langPostsDir)) {
      const postFiles = fs.readdirSync(langPostsDir).filter(file => file.endsWith('.md'));

      postFiles.forEach(file => {
        const filePath = path.join(langPostsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { meta } = parseMarkdownFrontmatter(fileContent);

        const slug = meta.slug || path.basename(file, '.md');
        const title = meta.title || slug;
        const desc = meta.description || descriptions[lang].blog;
        const fullTitle = `David Dumont | ${title}`;
        const date = meta.date || new Date().toISOString();
        const image = meta.image ? `${BASE_URL}${meta.image}` : `${BASE_URL}/images/profile-small.png`;

        const articleUrlPath = lang === 'en' ? `blog/${slug}` : `de/blog/${slug}`;
        const pageUrl = `${BASE_URL}/${articleUrlPath}`;

        langPosts.push({
          slug,
          title,
          description: desc,
          date,
          image,
          url: pageUrl,
        });

        // Register in sitemap
        sitemapUrls.push({
          loc: pageUrl,
          lastmod: date.split('T')[0],
          priority: '0.8',
          changefreq: 'monthly',
        });

        // Generate JSON-LD BlogPosting Schema
        const jsonLd = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": title,
          "description": desc,
          "image": image,
          "datePublished": date,
          "author": {
            "@type": "Person",
            "name": "David Dumont",
            "url": BASE_URL
          },
          "publisher": {
            "@type": "Person",
            "name": "David Dumont",
            "url": BASE_URL
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
          }
        };

        const jsonLdScript = `\n    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>`;

        let html = template;
        html = html.replace('<html lang="en">', `<html lang="${lang}">`);
        html = html.replace(/<title>[^<]*<\/title>/g, `<title>${fullTitle}</title>`);
        html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, `<meta name="description" content="${desc}" />`);
        html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/g, `<link rel="canonical" href="${pageUrl}" />`);
        
        // Open Graph Article metadata
        html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/g, `<meta property="og:type" content="article" />`);
        html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/g, `<meta property="og:url" content="${pageUrl}" />`);
        html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${fullTitle}" />`);
        html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${desc}" />`);
        html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/g, `<meta property="og:image" content="${image}" />`);

        // Twitter metadata
        html = html.replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>/g, `<meta property="twitter:url" content="${pageUrl}" />`);
        html = html.replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/g, `<meta property="twitter:title" content="${fullTitle}" />`);
        html = html.replace(/<meta property="twitter:description" content="[^"]*"\s*\/?>/g, `<meta property="twitter:description" content="${desc}" />`);
        html = html.replace(/<meta property="twitter:image" content="[^"]*"\s*\/?>/g, `<meta property="twitter:image" content="${image}" />`);

        // Insert JSON-LD before </head>
        html = html.replace('</head>', `${jsonLdScript}\n  </head>`);

        const outputDir = lang === 'en'
          ? path.join(DIST_DIR, 'blog', slug)
          : path.join(DIST_DIR, 'de', 'blog', slug);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
        console.log(`Prerendered Article [${lang}]: ${slug} -> ${outputDir}/index.html`);
      });

      // 3. Generate RSS Feed
      const rssXml = generateRssFeed(langPosts, lang);
      const rssPath = lang === 'en' ? path.join(DIST_DIR, 'rss.xml') : path.join(DIST_DIR, 'de', 'rss.xml');
      const rssDir = path.dirname(rssPath);
      if (!fs.existsSync(rssDir)) {
        fs.mkdirSync(rssDir, { recursive: true });
      }
      fs.writeFileSync(rssPath, rssXml, 'utf8');
      console.log(`Generated RSS feed [${lang}] -> ${rssPath}`);
    }
  });

  // 4. Generate dynamic sitemap.xml
  const sitemapXml = generateSitemap(sitemapUrls);
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemapXml, 'utf8');
  console.log(`Generated dynamic sitemap.xml with ${sitemapUrls.length} routes.`);
}

prerender();
