import ogImage from "@/assets/catch-og-1200x630.jpg.asset.json";

export const SITE_ORIGIN = "https://catch.fun";

// Absolute URL of the approved brand banner, sized 1200x630 for link previews.
export const SITE_PREVIEW_IMAGE = `${SITE_ORIGIN}${ogImage.url}`;

export const SITE_PREVIEW_META = [
  { property: "og:image", content: SITE_PREVIEW_IMAGE },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: "CATCH — 在真实地点发现代币化美股" },
  { name: "twitter:image", content: SITE_PREVIEW_IMAGE },
  { name: "twitter:image:alt", content: "CATCH — 在真实地点发现代币化美股" },
];
