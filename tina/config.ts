import { defineConfig } from "tinacms";

function extractDocInfo(document: any) {
  const pathStr =
    document?._sys?.relativePath ||
    document?._sys?.path ||
    document?.relativePath ||
    document?.path ||
    document?.id ||
    "";

  const isDe =
    pathStr.includes("/de/") ||
    pathStr.startsWith("de/") ||
    (document?._sys?.breadcrumbs && document._sys.breadcrumbs.includes("de"));
  const lang = isDe ? "de" : "en";

  let name =
    document?._values?.slideId ||
    document?._values?.slug ||
    document?.slideId ||
    document?.slug ||
    document?._sys?.filename ||
    "";

  if (!name && pathStr) {
    const filename = pathStr.split("/").pop() || "";
    name = filename.replace(/\.(json|md)$/, "");
  }

  return { lang, name };
}

export default defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || process.env.TINA_PUBLIC_CLIENT_ID || "990d6829-e24d-4076-bf14-9ee154bded4c",
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.TINA_PUBLIC_BRANCH ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD ||
    "main",
  token: process.env.TINA_TOKEN || "e44b680435ab5d35f7cdda34efdcfe4841bf4d4f",
  contentApiUrlOverride:
    typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
      ? "http://localhost:4004/graphql"
      : undefined,
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads",
    },
  },
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  schema: {
    collections: [
      {
        label: "Slide Pages",
        name: "pages",
        path: "content/pages",
        format: "json",
        ui: {
          router: ({ document }) => {
            const { lang, name } = extractDocInfo(document);
            if (!name) return undefined;
            return lang === "en" ? `/${name}` : `/${lang}/${name}`;
          },
        },
        fields: [
          {
            type: "string",
            name: "slideId",
            label: "Slide Anchor ID (e.g. welcome, strategy)",
            required: true,
          },
          {
            type: "string",
            name: "title",
            label: "Slide Title (Navigation Bar)",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "SEO Meta Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "object",
            name: "spatial",
            label: "3D Spatial Positioning",
            fields: [
              { type: "number", name: "x", label: "X Position (px)" },
              { type: "number", name: "y", label: "Y Position (px)" },
              { type: "number", name: "z", label: "Z Position (px, Depth)" },
              { type: "number", name: "scale", label: "Scale Multiplier (e.g. 1)" },
              { type: "number", name: "rotateX", label: "Rotate X (deg)" },
              { type: "number", name: "rotateY", label: "Rotate Y (deg)" },
              { type: "number", name: "rotateZ", label: "Rotate Z (deg)" },
            ],
          },
          {
            type: "object",
            name: "blocks",
            label: "Slide Content Modules",
            list: true,
            templates: [
              {
                name: "chat_module",
                label: "Interactive Fake Chat Module",
                fields: [
                  {
                    type: "object",
                    name: "chatMessages",
                    label: "Chat Messages Flow",
                    list: true,
                    fields: [
                      { type: "string", name: "name", label: "Sender Name" },
                      { type: "string", name: "msg", label: "Message Text", ui: { component: "textarea" } },
                      { type: "number", name: "delay", label: "Typing Delay (ms)" },
                      {
                        type: "string",
                        name: "align",
                        label: "Alignment",
                        options: ["left", "right"],
                      },
                    ],
                  },
                ],
              },
              {
                name: "content_row_module",
                label: "Content Rows (Alternating Layouts)",
                fields: [
                  {
                    type: "object",
                    name: "rows",
                    label: "Content Sections",
                    list: true,
                    fields: [
                      { type: "string", name: "rowId", label: "Row Anchor Key" },
                      { type: "string", name: "heading", label: "Section Heading" },
                      { type: "string", name: "text", label: "Body Text", ui: { component: "textarea" } },
                      { type: "image", name: "image", label: "Accompanying Visual" },
                      { type: "boolean", name: "isDarkRow", label: "Dark Theme Row" },
                    ],
                  },
                ],
              },
              {
                name: "contact_cards_module",
                label: "Contact Cards & Direct Channels",
                fields: [
                  {
                    type: "object",
                    name: "items",
                    label: "Channels",
                    list: true,
                    fields: [
                      { type: "string", name: "icon", label: "FontAwesome Icon (e.g. fas fa-envelope)" },
                      { type: "string", name: "title", label: "Channel Label" },
                      { type: "string", name: "text", label: "Display Detail / Link" },
                    ],
                  },
                ],
              },
              {
                name: "legal_text_module",
                label: "Legal Text / Imprint Module",
                fields: [
                  { type: "string", name: "text", label: "Full Legal Text", ui: { component: "textarea" } },
                ],
              },
              {
                name: "quote_module",
                label: "Hero Quote Module",
                fields: [
                  { type: "string", name: "quote", label: "Quote Text", ui: { component: "textarea" } },
                  { type: "string", name: "author", label: "Attribution / Author" },
                ],
              },
              {
                name: "timeline_module",
                label: "Timeline / Milestones Module",
                fields: [
                  { type: "string", name: "introHeading", label: "Intro Heading" },
                  { type: "string", name: "introText", label: "Intro Text", ui: { component: "textarea" } },
                  {
                    type: "object",
                    name: "items",
                    label: "Timeline Milestones",
                    list: true,
                    fields: [
                      { type: "string", name: "title", label: "Year / Milestone Title" },
                      { type: "string", name: "subtitle", label: "Subtitle / Role" },
                      { type: "string", name: "text", label: "Details", ui: { component: "textarea" } },
                    ],
                  },
                ],
              },
              {
                name: "bento_grid_module",
                label: "Bento Grid Feature Showcase",
                fields: [
                  { type: "string", name: "heading", label: "Section Heading" },
                  { type: "string", name: "subheading", label: "Subheading / Lead" },
                  {
                    type: "object",
                    name: "cards",
                    label: "Bento Cards",
                    list: true,
                    fields: [
                      { type: "string", name: "title", label: "Card Title" },
                      { type: "string", name: "text", label: "Card Description", ui: { component: "textarea" } },
                      { type: "image", name: "image", label: "Card Visual / Asset" },
                      {
                        type: "string",
                        name: "gridSize",
                        label: "Grid Span",
                        options: ["1x1", "2x1", "1x2", "2x2"],
                      },
                      { type: "boolean", name: "isDarkCard", label: "Dark Highlight Card" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: "Blog Posts",
        name: "posts",
        path: "content/posts",
        format: "md",
        ui: {
          router: ({ document }) => {
            const { lang, name } = extractDocInfo(document);
            if (!name) return undefined;
            return lang === "en" ? `/blog/${name}` : `/${lang}/blog/${name}`;
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Article Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL Slug",
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Publication Date",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Excerpt / SEO Description",
            ui: {
              component: "textarea",
            },
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Cover / Hero Image",
          },
          {
            type: "string",
            name: "tags",
            label: "Tags / Categories",
            list: true,
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured Article (Hero Banner)",
          },
          {
            type: "string",
            name: "readingTime",
            label: "Reading Time (e.g. 4 min read)",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Article Body Content",
            isBody: true,
          },
        ],
      },
    ],
  },
});
