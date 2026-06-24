import {
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  FileText,
  Mail,
  Download,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { ProjectList } from "./SocialLink";
import { SectionHeading } from "./SectionHeading";
import { SocialIconRow } from "./SocialIconRow";
import { TypewriterText } from "./TypewriterText";
import { SecretHeart } from "./SecretHeart";
import Footer from "./Footer";
import GitHubStats from "./GitHubStats";
import MonkeytypeStats from "./MonkeytypeStats";
import SpotifyStats from "./SpotifyStats";
import WakatimeStats from "./WakatimeStats";
import { TilListPreview } from "./TilListPreview";
import { TilIndexPage } from "./TilIndexPage";
import { TilTagsPage } from "./TilTagsPage";
import { TilTagPage } from "./TilTagPage";
import { TilGraphPage } from "./TilGraphPage";
import { NotFoundPage } from "./NotFoundPage";
import { PageShell } from "./PageShell";
import { TilNotePage, prefetchTilNotePage } from "./tilNotePageLoader";
import { createReveal } from "./entrance";

const MAX_STORED_SCROLL_POSITIONS = 20;

export default function App() {
  const [path, setPath] = useState(() =>
    normalizePath(window.location.pathname || "/")
  );
  const [skipEntranceAnimation, setSkipEntranceAnimation] = useState(false);
  const currentPathRef = useRef(path);
  const scrollPositionsRef = useRef(new Map());
  // Tracks how deep we are in this app's own history stack so the back button
  // knows whether going back stays in-app (vs leaving the site on a deep link).
  const historyIndexRef = useRef(0);

  useEffect(() => {
    const originalScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    // Seed the current entry with an index so back navigation can be detected.
    if (window.history.state?.index == null) {
      window.history.replaceState(
        { ...window.history.state, index: 0 },
        ""
      );
    }
    historyIndexRef.current = window.history.state?.index ?? 0;

    const handlePopState = (event) => {
      rememberScrollPosition(
        scrollPositionsRef.current,
        currentPathRef.current,
        window.scrollY
      );

      historyIndexRef.current = event.state?.index ?? 0;
      const nextPath = normalizePath(window.location.pathname || "/");
      const hasSavedPosition = scrollPositionsRef.current.has(nextPath);
      currentPathRef.current = nextPath;
      setSkipEntranceAnimation(hasSavedPosition);
      setPath(nextPath);
      restoreScroll(nextPath);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.history.scrollRestoration = originalScrollRestoration;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Warm the TilNotePage chunk during idle time so opening a note is instant.
  useEffect(() => {
    const schedule = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = schedule(() => prefetchTilNotePage());
    return () => cancel(handle);
  }, []);

  const restoreScroll = (to, fallbackTop = 0) => {
    const savedPosition = scrollPositionsRef.current.get(to);

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: savedPosition ?? fallbackTop,
        behavior: "auto",
      });
    });
  };

  const navigate = (to, options = {}) => {
    const nextPath = normalizePath(to);
    rememberScrollPosition(
      scrollPositionsRef.current,
      currentPathRef.current,
      window.scrollY
    );

    if (window.location.pathname !== nextPath) {
      const nextIndex = historyIndexRef.current + 1;
      window.history.pushState({ index: nextIndex }, "", nextPath);
      historyIndexRef.current = nextIndex;
    }

    currentPathRef.current = nextPath;
    setSkipEntranceAnimation(Boolean(options.skipEntranceAnimation));
    setPath(nextPath);
    restoreScroll(nextPath, options.restoreScroll ? undefined : 0);
  };

  const navigateHome = () => {
    const hasSavedPosition = scrollPositionsRef.current.has("/");
    navigate("/", {
      restoreScroll: hasSavedPosition,
      skipEntranceAnimation: hasSavedPosition,
    });
  };

  // Go to the previous in-app page. If there's nothing in our stack to go back
  // to (e.g. the visitor deep-linked straight to a note), fall back to home so
  // the button never bounces the user off the site.
  const goBack = () => {
    if (historyIndexRef.current > 0) {
      window.history.back();
    } else {
      navigateHome();
    }
  };

  const isTilTagsIndex = path === "/til/tags";
  const isTilGraph = path === "/til/graph";
  const tilTag = getTilTag(path);
  // /til/tags, /til/tags/<tag> and /til/graph are matched before the generic
  // /til/<slug> note route so they aren't mistaken for a note slug.
  const tilSlug =
    isTilTagsIndex || isTilGraph || tilTag ? null : getTilSlug(path);
  const isTilIndex = path === "/til";
  const reveal = createReveal(skipEntranceAnimation);

  useEffect(() => {
    if (path === "/") {
      document.title = "Rizky Ilham Pratama";
      return;
    }

    if (isTilIndex) {
      document.title = "Today I Learned | Rizky Ilham Pratama";
      return;
    }

    if (isTilTagsIndex) {
      document.title = "Browse by tag | Rizky Ilham Pratama";
      return;
    }

    if (isTilGraph) {
      document.title = "Garden graph | Rizky Ilham Pratama";
      return;
    }

    if (tilTag) {
      document.title = `#${tilTag} | Rizky Ilham Pratama`;
      return;
    }

    // TilNotePage sets its own title once the note resolves (title isn't known
    // synchronously here), so leave the title alone for /til/<slug> routes.
    if (tilSlug) {
      return;
    }

    document.title = "Page not found | Rizky Ilham Pratama";
  }, [path, isTilIndex, isTilTagsIndex, isTilGraph, tilTag, tilSlug]);

  if (isTilIndex) {
    return (
      <Suspense fallback={null}>
        <TilIndexPage
          onNavigate={navigate}
          onBack={goBack}
          skipEntranceAnimation={skipEntranceAnimation}
        />
      </Suspense>
    );
  }

  if (isTilTagsIndex) {
    return (
      <Suspense fallback={null}>
        <TilTagsPage
          onNavigate={navigate}
          onBack={goBack}
          skipEntranceAnimation={skipEntranceAnimation}
        />
      </Suspense>
    );
  }

  if (isTilGraph) {
    return (
      <Suspense fallback={null}>
        <TilGraphPage
          onNavigate={navigate}
          onBack={goBack}
          skipEntranceAnimation={skipEntranceAnimation}
        />
      </Suspense>
    );
  }

  if (tilTag) {
    return (
      <Suspense fallback={null}>
        <TilTagPage
          tag={tilTag}
          onNavigate={navigate}
          onBack={goBack}
          skipEntranceAnimation={skipEntranceAnimation}
        />
      </Suspense>
    );
  }

  if (tilSlug) {
    return (
      <Suspense fallback={null}>
        <TilNotePage
          slug={tilSlug}
          onNavigate={navigate}
          onBack={goBack}
          skipEntranceAnimation={skipEntranceAnimation}
        />
      </Suspense>
    );
  }

  if (path !== "/") {
    return (
      <NotFoundPage
        skipEntranceAnimation={skipEntranceAnimation}
        onBack={goBack}
      />
    );
  }

  const projects = [
    {
      href: "https://spdhtc.rizkyilhampra.dev",
      icon: Globe,
      label: "SPDHTC",
      description:
        "Expert system for chili diseases — fast diagnosis with step-by-step fixes.",
      ariaLabel:
        "Open SPDHTC — expert system for chili diseases; fast diagnosis with step-by-step fixes",
      title: "SPDHTC — expert system for chili diseases",
    },
    {
      href: "https://tt.rizkyilhampra.dev",
      icon: Download,
      label: "TikTok Downloader",
      description:
        "Save TikTok videos in HD/FullHD — no ads, no watermark, batch downloads.",
      ariaLabel:
        "Open TikTok Downloader — save TikTok videos in HD/FullHD with no ads and batch downloads",
      title: "TikTok Downloader — HD/FullHD, no ads, batch downloads",
    },
    {
      href: "https://blog.rizkyilhampra.dev",
      icon: FileText,
      label: "Blog",
      description: "Longer-form thoughts and tutorials.",
      ariaLabel: "Read posts on Rizky Ilham Pratama’s blog",
      title: "Rizky Ilham Pratama — Blog",
    },
  ];

  const socials = [
    {
      href: "mailto:rizkyilhampra@rizkyilhampra.dev",
      icon: Mail,
      label: "Email",
      ariaLabel: "Send an email to Rizky Ilham Pratama",
      title: "Email",
    },
    {
      href: "https://github.com/rizkyilhampra",
      icon: Github,
      label: "GitHub",
      ariaLabel: "Open GitHub profile @rizkyilhampra",
      title: "GitHub: @rizkyilhampra",
    },
    {
      href: "https://x.com/rizkyilhampra",
      icon: Twitter,
      label: "X",
      ariaLabel: "Open X profile @rizkyilhampra",
      title: "X (Twitter): @rizkyilhampra",
    },
    {
      href: "https://www.linkedin.com/in/rizkyilhampra",
      icon: Linkedin,
      label: "LinkedIn",
      ariaLabel: "Open LinkedIn profile rizkyilhampra",
      title: "LinkedIn: rizkyilhampra",
    },
    {
      href: "https://instagram.com/rizkyilhampra",
      icon: Instagram,
      label: "Instagram",
      ariaLabel: "Open Instagram profile @rizkyilhampra",
      title: "Instagram: @rizkyilhampra",
    },
  ];

  return (
    <PageShell onNavigate={navigate}>
      {/* Hero */}
      <section {...reveal(0)}>
        <h1 className="font-header text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Rizky Ilham Pratama
        </h1>

        <div className="mt-3 text-lg text-muted-foreground sm:text-xl">
          <TypewriterText
            texts={[
              "Developer, Creator, and Digital Enthusiast",
              "Building digital experiences with passion and precision",
              "Turning ideas into interactive solutions",
              "Use VIM and Arch Linux BTW",
            ]}
            typingSpeed={100}
            deletingSpeed={60}
            pauseDuration={3000}
          />
        </div>

        <SocialIconRow
          items={socials}
          trailing={<SecretHeart />}
          className="mt-6 -ml-2"
        />
      </section>

      <SectionDivider />

      {/* Projects */}
      <section {...reveal(1)}>
        <SectionHeading eyebrow="~/projects" title="Projects">
          Things I’ve built and keep running.
        </SectionHeading>
        <ProjectList items={projects} />
      </section>

      <SectionDivider />

      {/* Today I Learned (digital garden) */}
      <section {...reveal(2)}>
        <TilListPreview onNavigate={navigate} />
      </section>

      <SectionDivider />

      {/* Listening */}
      <section {...reveal(3)}>
        <SpotifyStats />
      </section>

      <SectionDivider />

      {/* Typing */}
      <section {...reveal(4)}>
        <MonkeytypeStats />
      </section>

      <SectionDivider />

      {/* GitHub */}
      <section {...reveal(5)}>
        <GitHubStats className="" />
      </section>

      <SectionDivider />

      {/* Coding */}
      <section {...reveal(6)}>
        <WakatimeStats className="" />
      </section>

      <SectionDivider />

      <Footer />
    </PageShell>
  );
}

function SectionDivider() {
  return <hr className="my-12 border-border sm:my-14" />;
}

function normalizePath(path) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function getTilSlug(path) {
  return path.startsWith("/til/") ? path.slice("/til/".length) : null;
}

function getTilTag(path) {
  if (!path.startsWith("/til/tags/")) return null;
  const raw = path.slice("/til/tags/".length);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function rememberScrollPosition(scrollPositions, path, position) {
  scrollPositions.set(path, position);

  if (scrollPositions.size <= MAX_STORED_SCROLL_POSITIONS) {
    return;
  }

  const oldestPath = scrollPositions.keys().next().value;
  scrollPositions.delete(oldestPath);
}
