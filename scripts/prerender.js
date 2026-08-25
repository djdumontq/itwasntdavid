const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const PAGES_DIR = path.join(__dirname, '../content/pages');

// Hardcoded meta descriptions matching App.tsx
const descriptions = {
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

const BASE_URL = "https://itwasntdavid.de";

function prerender() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error("Template index.html not found in dist/. Please run build first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const languages = ['en', 'de'];

  languages.forEach(lang => {
    const langDir = path.join(PAGES_DIR, lang);
    if (!fs.existsSync(langDir)) {
      console.warn(`Language directory ${langDir} does not exist. Skipping.`);
      return;
    }

    const files = fs.readdirSync(langDir).filter(file => file.endsWith('.json'));

    files.forEach(file => {
      const slideId = path.basename(file, '.json');
      const jsonPath = path.join(langDir, file);
      let title = slideId.charAt(0).toUpperCase() + slideId.slice(1);
      const descList = descriptions[lang] || descriptions.en;
      let desc = descList[slideId] || descList.welcome;
      
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (data.title) {
          title = data.title;
        }
        if (data.description) {
          desc = data.description;
        }
      } catch (e) {
        console.warn(`Could not read metadata from ${jsonPath}, using fallback.`);
      }

      const fullTitle = `David Dumont | ${title}`;
      
      // Localized canonical / sharing URL paths
      let pageUrlPath = lang === 'en' ? slideId : `de/${slideId}`;
      if (slideId === 'welcome') {
        pageUrlPath = lang === 'en' ? '' : 'de';
      }
      const pageUrl = pageUrlPath ? `${BASE_URL}/${pageUrlPath}` : `${BASE_URL}/`;

      let html = template;
      
      // Set correct lang attribute on html tag
      html = html.replace('<html lang="en">', `<html lang="${lang}">`);

      // Replace Title
      html = html.replace(/<title>[^<]*<\/title>/g, `<title>${fullTitle}</title>`);
      
      // Replace meta tags
      html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, `<meta name="description" content="${desc}" />`);
      html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/g, `<link rel="canonical" href="${pageUrl}" />`);
      
      // Replace Open Graph url / title / description
      html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/g, `<meta property="og:url" content="${pageUrl}" />`);
      html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${fullTitle}" />`);
      html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${desc}" />`);
      
      // Replace Twitter url / title / description
      html = html.replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>/g, `<meta property="twitter:url" content="${pageUrl}" />`);
      html = html.replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/g, `<meta property="twitter:title" content="${fullTitle}" />`);
      html = html.replace(/<meta property="twitter:description" content="[^"]*"\s*\/?>/g, `<meta property="twitter:description" content="${desc}" />`);

      // Determine output directory:
      // EN strategy -> dist/strategy
      // DE strategy -> dist/de/strategy
      const outputDir = lang === 'en' 
        ? path.join(DIST_DIR, slideId)
        : path.join(DIST_DIR, 'de', slideId);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
      console.log(`Prerendered [${lang}]: ${slideId} -> ${outputDir}/index.html`);

      // Handle root paths:
      // EN welcome -> dist/index.html
      // DE welcome -> dist/de/index.html
      if (slideId === 'welcome') {
        if (lang === 'en') {
          fs.writeFileSync(templatePath, html, 'utf8');
          console.log(`Updated root index.html with welcome metadata.`);
        } else if (lang === 'de') {
          const deRootDir = path.join(DIST_DIR, 'de');
          if (!fs.existsSync(deRootDir)) {
            fs.mkdirSync(deRootDir, { recursive: true });
          }
          fs.writeFileSync(path.join(deRootDir, 'index.html'), html, 'utf8');
          console.log(`Prerendered: de/welcome -> ${deRootDir}/index.html (German root)`);
        }
      }
    });
  });
}

prerender();
