const postPromiseCache = new Map();

export const blogPosts = [
  {
    slug: "how-useeffect-works",
    title: "How useEffect works",
    date: "2026-05-16",
    sourceLinks: [
      {
        title: "useEffect",
        url: "https://react.dev/reference/react/useEffect",
      },
      {
        title: "Synchronizing with Effects",
        url: "https://react.dev/learn/synchronizing-with-effects",
      },
    ],
  },
  {
    slug: "thinking-in-react",
    title: "Thinking in React, summarized",
    date: "2026-05-16",
    sourceLinks: [
      {
        title: "Thinking in React",
        url: "https://react.dev/learn/thinking-in-react",
      },
    ],
  },
];

export const latestPosts = blogPosts.slice(0, 2);

export function findPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug);
}

export function loadPostBySlug(slug) {
  if (postPromiseCache.has(slug)) return postPromiseCache.get(slug);

  const metadata = findPostBySlug(slug);
  if (!metadata) return Promise.resolve(null);

  const promise = fetch(`/posts/${slug}.md`)
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load post: ${slug}`);
      return r.text();
    })
    .then((markdown) => {
      const { content, readingTime, description } = parsePost(markdown);
      return { ...metadata, content, readingTime, description };
    });

  postPromiseCache.set(slug, promise);
  return promise;
}

function calculateReadingTime(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

function extractDescription(blocks) {
  const first = blocks.find((b) => b.type === "paragraph");
  if (!first) return "";
  const { text } = first;
  if (text.length <= 160) return text;
  return text.slice(0, text.lastIndexOf(" ", 160)) + "…";
}

function parsePost(markdown) {
  const normalizedMarkdown = markdown.replace(/\r\n/g, "\n");
  const frontmatterMatch = normalizedMarkdown.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  );

  if (!frontmatterMatch) {
    throw new Error("Blog post is missing frontmatter");
  }

  const body = frontmatterMatch[2];
  const content = parseMarkdownBlocks(body);

  return {
    content,
    readingTime: calculateReadingTime(body),
    description: extractDescription(content),
  };
}

function parseMarkdownBlocks(markdown) {
  const blocks = [];
  const lines = markdown.trim().split("\n");
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraph.join(" "),
    });
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.startsWith("```")) {
      flushParagraph();

      const language = line.replace("```", "").trim() || "text";
      const code = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }

      blocks.push({
        type: "code",
        language,
        code: code.join("\n"),
      });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({
        type: "heading",
        text: line.slice(3),
      });
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}
