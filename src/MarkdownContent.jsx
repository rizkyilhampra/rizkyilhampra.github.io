import {
  Check,
  Copy,
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react";
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

// Botanical-ink Prism theme: maps each scope onto the garden-ink `--code-*`
// dye tokens (defined in style.css) so highlighting tracks the light/dark theme.
const gardenInkSyntaxTheme = {
  'code[class*="language-"]': {
    color: "var(--code-text)",
    background: "transparent",
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    fontSize: "0.875rem",
    lineHeight: 1.7,
    textShadow: "none",
    whiteSpace: "pre",
  },
  'pre[class*="language-"]': {
    color: "var(--code-text)",
    background: "transparent",
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    fontSize: "0.875rem",
    lineHeight: 1.7,
    margin: 0,
    padding: "1rem",
    textShadow: "none",
  },
  comment: { color: "var(--code-comment)", fontStyle: "italic" },
  prolog: { color: "var(--code-comment)" },
  doctype: { color: "var(--code-comment)" },
  cdata: { color: "var(--code-comment)" },
  punctuation: { color: "var(--code-punctuation)" },
  property: { color: "var(--code-tag)" },
  tag: { color: "var(--code-tag)" },
  boolean: { color: "var(--code-number)" },
  number: { color: "var(--code-number)" },
  constant: { color: "var(--code-number)" },
  symbol: { color: "var(--code-type)" },
  selector: { color: "var(--code-string)" },
  "attr-name": { color: "var(--code-type)" },
  string: { color: "var(--code-string)" },
  char: { color: "var(--code-string)" },
  builtin: { color: "var(--code-type)" },
  inserted: { color: "var(--code-string)" },
  operator: { color: "var(--code-operator)" },
  entity: { color: "var(--code-operator)" },
  url: { color: "var(--code-operator)" },
  variable: { color: "var(--code-text)" },
  atrule: { color: "var(--code-special)" },
  "attr-value": { color: "var(--code-string)" },
  function: { color: "var(--code-function)" },
  "class-name": { color: "var(--code-type)" },
  keyword: { color: "var(--code-keyword)" },
  regex: { color: "var(--code-special)" },
  important: { color: "var(--code-tag)", fontWeight: "600" },
  bold: { fontWeight: "600" },
  italic: { fontStyle: "italic" },
  deleted: { color: "var(--code-tag)" },
};

const HEADING_CLASS = {
  1: "font-header text-3xl font-semibold text-foreground",
  2: "font-header text-2xl font-semibold text-foreground",
  3: "font-header text-xl font-semibold text-foreground",
  4: "font-header text-lg font-semibold text-foreground",
};

const NavigateContext = createContext(null);
const EXTERNAL_HREF = /^https?:\/\//;

// GitHub-flavored alert blockquotes (`> [!NOTE]` etc). Each type maps to an icon
// and a GitHub-matching accent color (light/dark variants tracked via Tailwind).
const ALERT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i;
const ALERT_CONFIG = {
  note: {
    label: "Note",
    Icon: Info,
    border: "border-blue-500/70",
    accent: "text-blue-600 dark:text-blue-400",
    tint: "bg-blue-500/5",
  },
  tip: {
    label: "Tip",
    Icon: Lightbulb,
    border: "border-emerald-500/70",
    accent: "text-emerald-600 dark:text-emerald-400",
    tint: "bg-emerald-500/5",
  },
  important: {
    label: "Important",
    Icon: MessageSquareWarning,
    border: "border-purple-500/70",
    accent: "text-purple-600 dark:text-purple-400",
    tint: "bg-purple-500/5",
  },
  warning: {
    label: "Warning",
    Icon: TriangleAlert,
    border: "border-amber-500/70",
    accent: "text-amber-600 dark:text-amber-400",
    tint: "bg-amber-500/5",
  },
  caution: {
    label: "Caution",
    Icon: OctagonAlert,
    border: "border-red-500/70",
    accent: "text-red-600 dark:text-red-400",
    tint: "bg-red-500/5",
  },
};

// Detects a GitHub alert blockquote. Returns null for plain blockquotes; on a
// match returns the alert `type` plus the blockquote's content tokens with the
// `[!TYPE]` marker stripped from the first paragraph (dropping it if now empty).
function parseAlert(token) {
  const [first, ...rest] = token.tokens ?? [];
  if (!first || first.type !== "paragraph") return null;
  const match = first.text?.match(ALERT_MARKER);
  if (!match) return null;

  const type = match[1].toLowerCase();
  const [firstInline, ...restInline] = first.tokens ?? [];
  // A paragraph whose text matched the anchored marker always starts with a
  // `text` inline token; bail to a plain blockquote if marked ever says otherwise.
  if (firstInline?.type !== "text") return null;

  const text = firstInline.text.replace(ALERT_MARKER, "");
  const inline = text ? [{ ...firstInline, text }, ...restInline] : restInline;
  const tokens = inline.length ? [{ ...first, tokens: inline }, ...rest] : rest;
  return { type, tokens };
}

function Alert({ type, tokens }) {
  const { label, Icon, border, accent, tint } = ALERT_CONFIG[type];
  return (
    <div className={`rounded-r border-l-4 ${border} ${tint} py-3 pl-4 pr-3`}>
      <div className={`mb-1 flex items-center gap-2 font-header text-sm font-medium ${accent}`}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {label}
      </div>
      <div className="space-y-3 text-base leading-8 text-muted-foreground">
        <Blocks tokens={tokens} />
      </div>
    </div>
  );
}

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

    case "blockquote": {
      const alert = parseAlert(token);
      if (alert) return <Alert type={alert.type} tokens={alert.tokens} />;
      return (
        <blockquote className="border-l-2 border-primary/60 pl-4 text-base italic leading-8 text-muted-foreground">
          <Blocks tokens={token.tokens} />
        </blockquote>
      );
    }

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
    <figure className="overflow-hidden rounded-lg border border-border bg-secondary/50">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border bg-secondary/80 px-4 py-3 text-xs text-muted-foreground">
        <p className="font-['JetBrains_Mono'] font-medium uppercase tracking-wide text-muted-foreground">
          {language}
        </p>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex min-w-[5.75rem] items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 font-['JetBrains_Mono'] font-medium text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          style={gardenInkSyntaxTheme}
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
