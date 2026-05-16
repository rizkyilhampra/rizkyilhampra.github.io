import { Check, Copy } from "lucide-react";
import { Suspense, use, useEffect, useRef, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import { InternalHomeLink } from "./InternalHomeLink";
import { loadPostBySlug } from "./blogPosts";
import { PageShell } from "./PageShell";
import { PostMeta } from "./PostMeta";
import Footer from "./Footer";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);

const catppuccinSyntaxTheme = {
  'code[class*="language-"]': {
    color: "var(--syntax-text)",
    background: "transparent",
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    fontSize: "0.875rem",
    lineHeight: 1.7,
    textShadow: "none",
    whiteSpace: "pre",
  },
  'pre[class*="language-"]': {
    color: "var(--syntax-text)",
    background: "transparent",
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    fontSize: "0.875rem",
    lineHeight: 1.7,
    margin: 0,
    padding: "1rem",
    textShadow: "none",
  },
  comment: { color: "var(--syntax-comment)", fontStyle: "italic" },
  prolog: { color: "var(--syntax-comment)" },
  doctype: { color: "var(--syntax-comment)" },
  cdata: { color: "var(--syntax-comment)" },
  punctuation: { color: "var(--syntax-punctuation)" },
  property: { color: "var(--syntax-red)" },
  tag: { color: "var(--syntax-red)" },
  boolean: { color: "var(--syntax-peach)" },
  number: { color: "var(--syntax-peach)" },
  constant: { color: "var(--syntax-peach)" },
  symbol: { color: "var(--syntax-yellow)" },
  selector: { color: "var(--syntax-green)" },
  "attr-name": { color: "var(--syntax-yellow)" },
  string: { color: "var(--syntax-green)" },
  char: { color: "var(--syntax-green)" },
  builtin: { color: "var(--syntax-yellow)" },
  inserted: { color: "var(--syntax-green)" },
  operator: { color: "var(--syntax-sky)" },
  entity: { color: "var(--syntax-sky)" },
  url: { color: "var(--syntax-sky)" },
  variable: { color: "var(--syntax-text)" },
  atrule: { color: "var(--syntax-mauve)" },
  "attr-value": { color: "var(--syntax-green)" },
  function: { color: "var(--syntax-blue)" },
  "class-name": { color: "var(--syntax-yellow)" },
  keyword: { color: "var(--syntax-mauve)" },
  regex: { color: "var(--syntax-peach)" },
  important: { color: "var(--syntax-red)", fontWeight: "600" },
  bold: { fontWeight: "600" },
  italic: { fontStyle: "italic" },
  deleted: { color: "var(--syntax-red)" },
};

export function BlogPostPage({ post, onNavigateHome, skipEntranceAnimation }) {
  const postPromise = loadPostBySlug(post.slug);
  const entranceClass = skipEntranceAnimation
    ? ""
    : "animate-fade-in-up motion-reduce:animate-none";

  return (
    <PageShell mainClassName="relative z-10 container mx-auto px-6 py-16 md:py-20">
      <article className={`mx-auto max-w-3xl ${entranceClass}`}>
        <InternalHomeLink onNavigateHome={onNavigateHome} />

        <header className="border-b border-border pb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
            Blog post
          </p>
          <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {post.description}
          </p>
          <PostMeta post={post} />
        </header>

        <Suspense fallback={<PostContentSkeleton />}>
          <PostContent postPromise={postPromise} />
        </Suspense>

        <hr className="mt-12 border-border" />
      </article>

      <div className={`mx-auto mt-20 max-w-3xl text-center ${entranceClass}`}>
        <Footer />
      </div>
    </PageShell>
  );
}

function PostContent({ postPromise }) {
  const loadedPost = use(postPromise);
  const content = loadedPost?.content ?? [];

  return (
    <div className="mt-10 space-y-8">
      {content.map((block, index) => (
        <ContentBlock block={block} key={`${block.type}-${index}`} />
      ))}
    </div>
  );
}

function SkeletonBar({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-md bg-secondary/60 ${className}`} />
  );
}

function PostContentSkeleton() {
  return (
    <div className="mt-10 space-y-8" aria-hidden="true">
      <SkeletonBar className="h-6 w-2/5" />

      <div className="space-y-3">
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-3/4" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-secondary/40 px-4 py-3">
          <SkeletonBar className="h-3 w-16" />
        </div>
        <div className="space-y-2 p-4">
          <SkeletonBar className="h-3 w-3/5" />
          <SkeletonBar className="h-3 w-4/5" />
          <SkeletonBar className="h-3 w-2/5" />
          <SkeletonBar className="h-3 w-3/5" />
        </div>
      </div>

      <SkeletonBar className="h-6 w-1/3" />

      <div className="space-y-3">
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-5/6" />
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-2/3" />
      </div>

      <div className="space-y-3">
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-4/5" />
      </div>
    </div>
  );
}

function ContentBlock({ block }) {
  if (block.type === "heading") {
    return (
      <h2 className="font-header text-2xl font-semibold text-foreground">
        {block.text}
      </h2>
    );
  }

  if (block.type === "code") {
    return <CodeBlock block={block} />;
  }

  return (
    <p className="text-base leading-8 text-muted-foreground">
      {renderInlineCode(block.text)}
    </p>
  );
}

function renderInlineCode(text) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (!part.startsWith("`") || !part.endsWith("`")) {
      return part;
    }

    return (
      <code
        key={`${part}-${index}`}
        className="rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 font-['JetBrains_Mono'] text-sm text-foreground"
      >
        {part.slice(1, -1)}
      </code>
    );
  });
}

function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  const resetCopiedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resetCopiedTimerRef.current) {
        window.clearTimeout(resetCopiedTimerRef.current);
      }
    };
  }, []);

  const copyCode = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(block.code);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = block.code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (resetCopiedTimerRef.current) {
      window.clearTimeout(resetCopiedTimerRef.current);
    }

    setCopied(true);
    resetCopiedTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      resetCopiedTimerRef.current = null;
    }, 1800);
  };

  return (
    <figure className="overflow-hidden rounded-lg border border-[var(--syntax-border)] bg-[var(--syntax-bg)] shadow-card">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[var(--syntax-border)] bg-[var(--syntax-header)] px-4 py-3 text-xs text-[var(--syntax-muted)]">
        <p className="font-['JetBrains_Mono'] font-medium uppercase tracking-wide text-[var(--syntax-muted)]">
          {block.language}
        </p>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex min-w-[5.75rem] items-center justify-center gap-1.5 rounded-md border border-[var(--syntax-button-border)] bg-[var(--syntax-button-bg)] px-3 py-1.5 font-['JetBrains_Mono'] font-medium text-[var(--syntax-button-text)] transition-colors duration-200 hover:border-[var(--syntax-mauve)] hover:text-[var(--syntax-button-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--syntax-mauve)]"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>

      <SyntaxHighlighter
        language={block.language}
        style={catppuccinSyntaxTheme}
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.875rem",
          lineHeight: 1.7,
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
          },
        }}
      >
        {block.code}
      </SyntaxHighlighter>
    </figure>
  );
}
