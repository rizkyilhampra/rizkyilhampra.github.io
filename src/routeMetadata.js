export const SITE_URL = "https://rizkyilhampra.dev";
export const SITE_NAME = "Rizky Ilham Pratama";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/social-preview.svg`;

const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  jobTitle: "Software Developer",
};

export function normalizePath(pathname = "/") {
  const path = pathname.split("?")[0].split("#")[0] || "/";
  if (path === "/") return path;
  return path.replace(/\/+$/, "") || "/";
}

export function resolveRoute(pathname) {
  const path = normalizePath(pathname);

  if (path === "/") return { type: "home", path };
  if (path === "/til") return { type: "til-index", path };
  if (path === "/til/tags") return { type: "tags-index", path };

  const tagMatch = path.match(/^\/til\/tags\/([^/]+)$/);
  if (tagMatch) {
    return { type: "tag", path, tag: decodeSegment(tagMatch[1]) };
  }

  const noteMatch = path.match(/^\/til\/([^/]+)$/);
  if (noteMatch) {
    return { type: "note", path, slug: decodeSegment(noteMatch[1]) };
  }

  return { type: "not-found", path };
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function canonicalUrl(pathname) {
  const path = normalizePath(pathname);
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function pageTitle(title) {
  return `${title} — ${SITE_NAME}`;
}

function collectionSchema({ title, description, canonical, notes = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: notes.length,
      itemListElement: notes.map((note, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: canonicalUrl(`/til/${note.slug}`),
        name: note.title,
      })),
    },
  };
}

function tagCollectionSchema({ title, description, canonical, tags = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tags.length,
      itemListElement: tags.map(({ tag }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: canonicalUrl(`/til/tags/${encodeURIComponent(tag)}`),
        name: tag,
      })),
    },
  };
}

function noteSchema(note, canonical) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: note.title,
    description: note.description || `A Today I Learned note by ${SITE_NAME}.`,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    mainEntityOfPage: canonical,
    url: canonical,
    keywords: note.tags ?? [],
  };

  if (note.date) schema.datePublished = note.date;
  return schema;
}

export function getRouteMetadata(pathname, { notes = [], tags = [], note } = {}) {
  const route = resolveRoute(pathname);
  const canonical = canonicalUrl(route.path);
  const base = {
    canonical,
    robots: "index, follow",
    image: DEFAULT_OG_IMAGE,
    imageAlt: "Rizky Ilham Pratama — developer and creator",
    twitterCard: "summary_large_image",
    ogType: "website",
  };

  if (route.type === "home") {
    const description =
      "Rizky Ilham Pratama is a software developer and creator building practical web tools, digital experiences, and open-source projects.";
    return {
      ...base,
      title: pageTitle("Developer & Creator"),
      description,
      schemas: [PERSON_SCHEMA],
    };
  }

  if (route.type === "til-index") {
    const title = "Today I Learned";
    const description =
      "Short, interconnected notes by Rizky Ilham Pratama on Linux, self-hosting, developer tooling, and things learned along the way.";
    return {
      ...base,
      title: pageTitle(title),
      description,
      schemas: [collectionSchema({ title, description, canonical, notes })],
    };
  }

  if (route.type === "tags-index") {
    const title = "Browse TIL notes by tag";
    const description =
      "Explore Rizky Ilham Pratama's Today I Learned digital garden by topic and tag.";
    return {
      ...base,
      title: pageTitle(title),
      description,
      schemas: [tagCollectionSchema({ title, description, canonical, tags })],
    };
  }

  if (route.type === "tag") {
    const matchingNotes = notes.filter((item) =>
      (item.tags ?? []).some((tag) => tag.toLowerCase() === route.tag.toLowerCase())
    );
    const title = `${route.tag} notes`;
    const description = `Browse ${matchingNotes.length} Today I Learned note${matchingNotes.length === 1 ? "" : "s"} tagged ${route.tag}.`;
    return {
      ...base,
      title: pageTitle(title),
      description,
      schemas: [collectionSchema({ title, description, canonical, notes: matchingNotes })],
    };
  }

  if (route.type === "note" && note) {
    return {
      ...base,
      title: pageTitle(note.title),
      description: note.description || `A Today I Learned note by ${SITE_NAME}.`,
      ogType: "article",
      schemas: [noteSchema(note, canonical)],
    };
  }

  return {
    ...base,
    title: pageTitle("Page not found"),
    description: "This page does not exist on rizkyilhampra.dev.",
    robots: "noindex, follow",
    schemas: [],
  };
}

function upsertMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.append(element);
  }
  element.setAttribute("content", content);
}

export function getMetadataMetaFields(metadata) {
  return [
    ["name", "description", metadata.description],
    ["name", "robots", metadata.robots],
    ["property", "og:type", metadata.ogType],
    ["property", "og:url", metadata.canonical],
    ["property", "og:title", metadata.title],
    ["property", "og:description", metadata.description],
    ["property", "og:image", metadata.image],
    ["property", "og:image:alt", metadata.imageAlt],
    ["name", "twitter:card", metadata.twitterCard],
    ["name", "twitter:title", metadata.title],
    ["name", "twitter:description", metadata.description],
    ["name", "twitter:image", metadata.image],
  ];
}

export function applyRouteMetadata(metadata) {
  document.title = metadata.title;

  for (const [attribute, value, content] of getMetadataMetaFields(metadata)) {
    upsertMeta(`meta[${attribute}="${value}"]`, { [attribute]: value }, content);
  }

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.append(canonical);
  }
  canonical.setAttribute("href", metadata.canonical);

  let schema = document.head.querySelector("#route-structured-data");
  if (!schema) {
    schema = document.createElement("script");
    schema.id = "route-structured-data";
    schema.type = "application/ld+json";
    document.head.append(schema);
  }
  schema.textContent = JSON.stringify(metadata.schemas);
}
