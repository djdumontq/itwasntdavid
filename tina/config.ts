import { defineConfig } from "tinacms";

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
            return `/#/${document._sys.filename}`;
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
            type: "object",
            name: "spatial",
            label: "3D Spatial Position",
            fields: [
              { type: "number", name: "x", label: "X Coordinate" },
              { type: "number", name: "y", label: "Y Coordinate" },
              { type: "number", name: "z", label: "Z Coordinate" },
              { type: "number", name: "scale", label: "Scale" },
              { type: "number", name: "rotateX", label: "Rotate X" },
              { type: "number", name: "rotateY", label: "Rotate Y" },
              { type: "number", name: "rotateZ", label: "Rotate Z" },
            ],
          },
          {
            type: "object",
            name: "blocks",
            label: "Modular Content Blocks",
            list: true,
            templates: [
              {
                name: "chat_module",
                label: "💬 Welcome Chat Module",
                fields: [
                  {
                    type: "object",
                    name: "chatMessages",
                    label: "Chat Messages",
                    list: true,
                    fields: [
                      { type: "string", name: "name", label: "Message Key" },
                      { type: "string", name: "msg", label: "Message Text (HTML allowed)", ui: { component: "textarea" } },
                      { type: "number", name: "delay", label: "Delay (ms)" },
                      { type: "string", name: "align", label: "Alignment", options: ["left", "right"] },
                    ],
                  },
                ],
              },
              {
                name: "content_row_module",
                label: "📝 Text & Image Rows Module",
                fields: [
                  {
                    type: "object",
                    name: "rows",
                    label: "Content Rows",
                    list: true,
                    fields: [
                      { type: "string", name: "rowId", label: "Row ID" },
                      { type: "string", name: "heading", label: "Heading" },
                      { type: "string", name: "text", label: "Text Content", ui: { component: "textarea" } },
                      { type: "image", name: "image", label: "Row Image" },
                      { type: "boolean", name: "isDarkRow", label: "Dark Row Background" },
                    ],
                  },
                ],
              },
              {
                name: "contact_cards_module",
                label: "📇 Contact Cards Module",
                fields: [
                  {
                    type: "object",
                    name: "items",
                    label: "Contact Cards",
                    list: true,
                    fields: [
                      { type: "string", name: "icon", label: "FontAwesome Icon (e.g. fa-envelope)" },
                      { type: "string", name: "title", label: "Title" },
                      { type: "string", name: "text", label: "Details (HTML allowed)", ui: { component: "textarea" } },
                    ],
                  },
                ],
              },
              {
                name: "legal_text_module",
                label: "📄 Legal / Rich Text Module",
                fields: [
                  {
                    type: "string",
                    name: "text",
                    label: "Legal Text Content (HTML allowed)",
                    ui: { component: "textarea" },
                  },
                ],
              },
              {
                name: "quote_module",
                label: "📢 Callout Quote Module",
                fields: [
                  { type: "string", name: "quote", label: "Quote Text", ui: { component: "textarea" } },
                  { type: "string", name: "author", label: "Author / Subtitle" },
                ],
              },
              {
                name: "timeline_module",
                label: "⏳ Vertical Timeline Module",
                fields: [
                  { type: "string", name: "introHeading", label: "Intro Heading" },
                  { type: "string", name: "introText", label: "Intro Text", ui: { component: "textarea" } },
                  {
                    type: "object",
                    name: "items",
                    label: "Timeline Stations",
                    list: true,
                    fields: [
                      { type: "string", name: "title", label: "Station Title" },
                      { type: "string", name: "subtitle", label: "Subtitle / Sub-header" },
                      { type: "string", name: "text", label: "Description", ui: { component: "textarea" } },
                    ],
                  },
                ],
              },
              {
                name: "bento_grid_module",
                label: "🍱 Bento Grid Module",
                fields: [
                  { type: "string", name: "heading", label: "Heading" },
                  { type: "string", name: "subheading", label: "Subheading/Intro Text", ui: { component: "textarea" } },
                  {
                    type: "object",
                    name: "cards",
                    label: "Bento Cards",
                    list: true,
                    fields: [
                      { type: "string", name: "title", label: "Card Title" },
                      { type: "string", name: "text", label: "Card Text", ui: { component: "textarea" } },
                      { type: "image", name: "image", label: "Card Image/Illustration" },
                      {
                        type: "string",
                        name: "gridSize",
                        label: "Card Width",
                        options: [
                          { value: "4", label: "Small (1/3 width)" },
                          { value: "6", label: "Medium (1/2 width)" },
                          { value: "8", label: "Large (2/3 width)" },
                          { value: "12", label: "Full (100% width)" },
                        ],
                      },
                      { type: "boolean", name: "isDarkCard", label: "Dark Background Card" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
