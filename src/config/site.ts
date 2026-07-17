// Site configuration for SEO and JSON-LD schemas
export const siteConfig = {
  name: "BBPC",
  description:
    "Bindubasini Boys Programming Club platform built with Astro, Tailwind CSS, and TypeScript.",
  url: "https://bbpc.dev",
  ogImage: "https://bbpc.dev/images/openGraph/facebook.png",

  twitterImage: "https://bearnie.dev/images/openGraph/twitter.png",
  author: {
    name: "BBPC Team",
    url: "https://bbpc.dev",
    twitter: "@bbpc",
  },
  links: {
    twitter: "https://twitter.com/bbpc",
    github: "https://github.com/Bindubasini-Boys-Programming-Club",
  },

  // Organization info for JSON-LD
  organization: {
    name: "BBPC",
    logo: "https://bbpc.dev/images/logos/symbol.svg",
    sameAs: [
      "https://twitter.com/bbpc",
      "https://github.com/Bindubasini-Boys-Programming-Club",
    ],
  },

} as const;

export type SiteConfig = typeof siteConfig;
