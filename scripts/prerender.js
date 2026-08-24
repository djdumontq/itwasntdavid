const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const PAGES_DIR = path.join(__dirname, '../content/pages');

// Hardcoded meta descriptions matching App.tsx
const descriptions = {
  welcome: "Brand consultant helping leaders design honest strategies, write compelling stories, and deploy self-hosted digital infrastructure.",
  strategy: "Beyond the 'New Logo' Fallacy. Explore David Dumont's approach to strategic brand development, closing communication gaps, and emotional strategy.",
  ideology: "There is no cloud—just someone else's computer. Explore David Dumont's philosophy on digital sovereignty, data privacy, and hosting consulting.",
  implementation: "Tools I trust. How David Dumont builds clean, Git-backed systems with open-source tech like TinaCMS, NocoBase, and Docmost.",
  about: "Meet David Dumont. Learn about his career from traditional marketing agency lead to open-source self-hosting consultant.",
  contact: "Get in touch with David Dumont. Connect via email, LinkedIn, or schedule a consulting session.",
  imprint: "Legal imprint and contact details for David Dumont."
};

const BASE_URL = "https://itwasntdavid.de";

function prerender() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error("Template index.html not found in dist/. Please run build first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const files = fs.readdirSync(PAGES_DIR).filter(file => file.endsWith('.json'));

  files.forEach(file => {
    const slideId = path.basename(file, '.json');
    const jsonPath = path.join(PAGES_DIR, file);
    let title = slideId.charAt(0).toUpperCase() + slideId.slice(1);
    
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (data.title) {
        title = data.title;
      }
    } catch (e) {
      console.warn(`Could not read title from ${file}, using fallback.`);
    }

    const fullTitle = `David Dumont | ${title}`;
    const desc = descriptions[slideId] || descriptions.welcome;
    const pageUrl = `${BASE_URL}/${slideId}`;

    let html = template;
    
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

    const outputDir = path.join(DIST_DIR, slideId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
    console.log(`Prerendered: ${slideId} -> ${outputDir}/index.html`);

    if (slideId === 'welcome') {
      fs.writeFileSync(templatePath, html, 'utf8');
      console.log(`Updated root index.html with welcome metadata.`);
    }
  });
}

prerender();
