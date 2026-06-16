import { Check, Copy } from "lucide-react";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import powershell from "react-syntax-highlighter/dist/esm/languages/prism/powershell";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import nginx from "react-syntax-highlighter/dist/esm/languages/prism/nginx";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import { NoteLink } from "./NoteLink";

// The TIL notes are mostly shell scripts (bash/sh/powershell) with the
// occasional jsx/json/yaml/docker block, so register that set. Aliases map the
// fence labels people actually write (`sh`, `shell`, `js`, `yml`).
const languages = {
  bash,
  sh: bash,
  shell: bash,
  powershell,
  ps1: powershell,
  javascript,
  js: javascript,
  jsx,
  typescript,
  ts: typescript,
  tsx,
  python,
  py: python,
  json,
  yaml,
  yml: yaml,
  docker,
  dockerfile: docker,
  nginx,
  conf: nginx,
  sql,
  diff,
};
for (const [name, definition] of Object.entries(languages)) {
  SyntaxHighlighter.registerLanguage(name, definition);
}

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

const HEADING_CLASS = {
  1: "font-header text-3xl font-semibold text-foreground",
  2: "font-header text-2xl font-semibold text-foreground",
  3: "font-header text-xl font-semibold text-foreground",
  4: "font-header text-lg font-semibold text-foreground",
};

const NavigateContext = createContext(null);
const EXTERNAL_HREF = /^https?:\/\//;

// Renders a marked token list (from parseMarkdown) to React. Pass `onNavigate`
// so internal /til/ links use the SPA router instead of a full reload.
export function MarkdownContent({ tokens, onNavigate = null }) {
  return (
    <NavigateContext.Provider value={onNavigate}>
      <Blocks tokens={tokens} />
    </NavigateContext.Provider>
  );
}

// Returns blocks as a fragment so the caller's `space-y-*` wrapper sees them as
// direct children.
function Blocks({ tokens }) {
  return (
    <>
      {tokens.map((token, index) => (
        <Block token={token} key={`${token.type}-${index}`} />
      ))}
    </>
  );
}

function Block({ token }) {
  switch (token.type) {
    case "heading": {
      const Tag = `h${Math.min(token.depth, 4)}`;
      return (
        <Tag className={HEADING_CLASS[token.depth] ?? HEADING_CLASS[4]}>
          <Inline tokens={token.tokens} />
        </Tag>
      );
    }

    case "code":
      return <CodeBlock code={token.text} language={token.lang || "text"} />;

    case "blockquote":
      return (
        <blockquote className="border-l-2 border-primary/60 pl-4 text-base italic leading-8 text-muted-foreground">
          <Blocks tokens={token.tokens} />
        </blockquote>
      );

    case "list": {
      const ListTag = token.ordered ? "ol" : "ul";
      const marker = token.ordered ? "list-decimal" : "list-disc";
      return (
        <ListTag
          className={`${marker} space-y-2 pl-6 text-base leading-8 text-muted-foreground`}
        >
          {token.items.map((item, index) => (
            <li key={index}>
              <ListItem item={item} />
            </li>
          ))}
        </ListTag>
      );
    }

    case "hr":
      return <hr className="border-border" />;

    case "space":
      return null;

    case "paragraph":
      return (
        <p className="text-base leading-8 text-muted-foreground">
          <Inline tokens={token.tokens} />
        </p>
      );

    default:
      return token.text ? (
        <p className="text-base leading-8 text-muted-foreground">{token.text}</p>
      ) : null;
  }
}

// List items hold block tokens; a tight item is a single `text` token carrying
// inline children, which we render inline to avoid nested <p> spacing.
function ListItem({ item }) {
  const inlineTokens = [];
  const blockTokens = [];
  for (const token of item.tokens ?? []) {
    (token.type === "text" ? inlineTokens : blockTokens).push(token);
  }

  return (
    <>
      {inlineTokens.map((token, index) => (
        <Inline key={`i-${index}`} tokens={token.tokens ?? [token]} />
      ))}
      {blockTokens.length > 0 ? (
        <div className="mt-2 space-y-2">
          <Blocks tokens={blockTokens} />
        </div>
      ) : null}
    </>
  );
}

function Inline({ tokens }) {
  if (!tokens) return null;

  return (
    <>
      {tokens.map((token, index) => {
        const key = `${token.type}-${index}`;

        switch (token.type) {
          case "strong":
            return (
              <strong key={key} className="font-semibold text-foreground">
                <Inline tokens={token.tokens} />
              </strong>
            );
          case "em":
            return (
              <em key={key}>
                <Inline tokens={token.tokens} />
              </em>
            );
          case "del":
            return (
              <del key={key}>
                <Inline tokens={token.tokens} />
              </del>
            );
          case "codespan":
            return <InlineCode key={key}>{token.text}</InlineCode>;
          case "link":
            return (
              <Link key={key} href={token.href}>
                <Inline tokens={token.tokens} />
              </Link>
            );
          case "br":
            return <br key={key} />;
          default:
            return <Fragment key={key}>{token.text ?? ""}</Fragment>;
        }
      })}
    </>
  );
}

function Link({ href = "", children }) {
  const onNavigate = useContext(NavigateContext);

  if (href.startsWith("/til/")) {
    return (
      <NoteLink
        href={href}
        slug={href.slice("/til/".length)}
        onNavigate={onNavigate}
      >
        {children}
      </NoteLink>
    );
  }

  return (
    <a
      href={href}
      className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
      {...(EXTERNAL_HREF.test(href)
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
    >
      {children}
    </a>
  );
}

function InlineCode({ children }) {
  return (
    <code className="rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 font-['JetBrains_Mono'] text-sm text-foreground">
      {children}
    </code>
  );
}

function CodeBlock({ code, language }) {
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
      await navigator.clipboard.writeText(code);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = code;
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
          {language}
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

      {/* Horizontal scroll so long lines stay readable on narrow screens
          instead of being clipped by the figure's overflow-hidden. */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
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
          {code}
        </SyntaxHighlighter>
      </div>
    </figure>
  );
}
