const postCache = new Map();

export const blogPosts = [
  {
    slug: "how-useeffect-works",
    title: "How useEffect works",
    date: "2026-05-16",
    readingTime: "5 min read",
    description:
      "A practical walkthrough of React effects, dependency arrays, cleanup functions, and when not to reach for useEffect.",
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
    readingTime: "4 min read",
    description:
      "A practical summary of React's component-first workflow: split the UI, find state, and let data flow down.",
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

export async function loadPostBySlug(slug) {
  const metadata = findPostBySlug(slug);
  if (!metadata) return null;
  if (postCache.has(slug)) return postCache.get(slug);

  const markdown = await fetch(`/posts/${slug}.md`).then((r) => {
    if (!r.ok) throw new Error(`Failed to load post: ${slug}`);
    return r.text();
  });
  const result = { ...metadata, content: parsePost(markdown).content };
  postCache.set(slug, result);
  return result;
}

function parsePost(markdown) {
  const normalizedMarkdown = markdown.replace(/\r\n/g, "\n");
  const frontmatterMatch = normalizedMarkdown.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  );

  if (!frontmatterMatch) {
    throw new Error("Blog post is missing frontmatter");
  }

  return {
    content: parseMarkdownBlocks(frontmatterMatch[2]),
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
