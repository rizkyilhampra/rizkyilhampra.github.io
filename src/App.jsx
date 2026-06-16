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
import { SocialLink } from "./SocialLink";
import { TypewriterText } from "./TypewriterText";
import Footer from "./Footer";
import GitHubStats from "./GitHubStats";
import MonkeytypeStats from "./MonkeytypeStats";
import SpotifyStats from "./SpotifyStats";
import WakatimeStats from "./WakatimeStats";
import { TilListPreview } from "./TilListPreview";
import { TilIndexPage } from "./TilIndexPage";
import { NotFoundPage } from "./NotFoundPage";
import { PageShell } from "./PageShell";
import { TilNotePage, prefetchTilNotePage } from "./tilNotePageLoader";

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

  const tilSlug = getTilSlug(path);
  const isTilIndex = path === "/til";
  const entranceClass = (className) =>
    skipEntranceAnimation ? "" : className;

  useEffect(() => {
    if (path === "/") {
      document.title = "Rizky Ilham Pratama";
      return;
    }

    if (isTilIndex) {
      document.title = "Today I Learned | Rizky Ilham Pratama";
      return;
    }

    // TilNotePage sets its own title once the note resolves (title isn't known
    // synchronously here), so leave the title alone for /til/<slug> routes.
    if (tilSlug) {
      return;
    }

    document.title = "Page not found | Rizky Ilham Pratama";
  }, [path, isTilIndex, tilSlug]);

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

  const socialLinks = [
    {
      href: "mailto:rizkyilhampra@rizkyilhampra.dev",
      icon: Mail,
      label: "Email",
      description: "Get in touch directly",
      ariaLabel: "Send an email to Rizky Ilham Pratama",
      title: "Send an email to Rizky Ilham Pratama",
    },
    {
      href: "https://spdhtc.rizkyilhampra.dev",
      icon: Globe,
      label: "SPDHTC",
      description:
        "Expert system for chili diseases—fast diagnosis with step-by-step fixes",
      ariaLabel:
        "Open SPDHTC — expert system for chili diseases; fast diagnosis with step-by-step fixes",
      title: "SPDHTC — expert system for chili diseases",
    },
    {
      href: "https://tt.rizkyilhampra.dev",
      icon: Download,
      label: "TikTok Downloader",
      description:
        "Grab TikTok videos in HD/FullHD—no ads, no watermark hassle, with batch concurrent downloads",
      ariaLabel:
        "Open TikTok Downloader — save TikTok videos in HD/FullHD with no ads and batch downloads",
      title: "TikTok Downloader — HD/FullHD, no ads, batch downloads",
    },
    {
      href: "https://instagram.com/apainilala",
      icon: Instagram,
      label: "Instagram · @apainilala",
      description: "The muse behind many lines of code ❤️",
      ariaLabel: "Open Instagram profile @apainilala (beloved person)",
      title: "Instagram: @apainilala",
    },
    {
      href: "https://blog.rizkyilhampra.dev",
      icon: FileText,
      label: "Blog",
      description: "Thoughts and tutorials",
      ariaLabel: "Read posts on Rizky Ilham Pratama’s blog",
      title: "Rizky Ilham Pratama — Blog",
    },
    {
      href: "https://github.com/rizkyilhampra",
      icon: Github,
      label: "GitHub · @rizkyilhampra",
      description: "Open source projects and code",
      ariaLabel: "Open GitHub profile @rizkyilhampra",
      title: "GitHub: @rizkyilhampra",
    },
    {
      href: "https://instagram.com/rizkyilhampra",
      icon: Instagram,
      label: "Instagram · @rizkyilhampra",
      description: "Life updates and moments",
      ariaLabel: "Open Instagram profile @rizkyilhampra",
      title: "Instagram: @rizkyilhampra",
    },
    {
      href: "https://x.com/rizkyilhampra",
      icon: Twitter,
      label: "X · @rizkyilhampra",
      description: "Quick thoughts and updates",
      ariaLabel: "Open X profile @rizkyilhampra",
      title: "X (Twitter): @rizkyilhampra",
    },
    {
      href: "https://www.linkedin.com/in/rizkyilhampra",
      icon: Linkedin,
      label: "LinkedIn · rizkyilhampra",
      description: "Professional network",
      ariaLabel: "Open LinkedIn profile rizkyilhampra",
      title: "LinkedIn: rizkyilhampra",
    },
  ];

  return (
    <PageShell>
      {/* Hero Section */}
      <div
        className={`text-center mb-16 ${
          entranceClass("animate-fade-in-up motion-reduce:animate-none")
        }`}
        style={{ animationFillMode: "both" }}
      >
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-30 animate-glow" />
        </div>

        <h1
          className={`text-6xl md:text-7xl font-header font-semibold bg-gradient-primary bg-clip-text text-transparent mb-6 ${
            entranceClass("animate-scale-in motion-reduce:animate-none")
          }`}
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          Rizky Ilham Pratama
        </h1>

        <div className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 min-h-[4rem] sm:min-h-[3rem] md:min-h-[4rem] flex items-center justify-center">
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

        <div
          className={`w-24 h-1 bg-gradient-primary mx-auto rounded-full ${
            entranceClass("animate-scale-in motion-reduce:animate-none")
          }`}
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        />
      </div>

      {/* Links Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {socialLinks.map((link, index) => (
            <div
              key={link.href}
              className={
                entranceClass("animate-scale-in motion-reduce:animate-none")
              }
              style={{
                animationDelay: `${
                  0.3 + (index % 3) * 0.1 + Math.floor(index / 3) * 0.1
                }s`,
                animationFillMode: "both",
              }}
            >
              <SocialLink {...link} />
            </div>
          ))}
        </div>
      </div>

      {/* Today I Learned (digital garden) */}
      <div
        className={`max-w-6xl mx-auto ${
          entranceClass("animate-fade-in-up motion-reduce:animate-none")
        }`}
        style={{ animationDelay: "0.9s", animationFillMode: "both" }}
      >
        <TilListPreview onNavigate={navigate} />
      </div>

      {/* Spotify Stats */}
      <div
        className={`max-w-6xl mx-auto ${
          entranceClass("animate-fade-in-up motion-reduce:animate-none")
        }`}
        style={{ animationDelay: "1.1s", animationFillMode: "both" }}
      >
        <SpotifyStats />
      </div>

      {/* Typing Stats */}
      <div
        className={`max-w-6xl mx-auto ${
          entranceClass("animate-fade-in-up motion-reduce:animate-none")
        }`}
        style={{ animationDelay: "1.4s", animationFillMode: "both" }}
      >
        <MonkeytypeStats />
      </div>

      {/* Activity Stats */}
      <div
        className={`max-w-6xl mx-auto ${
          entranceClass("animate-fade-in-up motion-reduce:animate-none")
        }`}
        style={{ animationDelay: "1.7s", animationFillMode: "both" }}
      >
        <div className="mt-16 md:mt-20 grid gap-x-6 gap-y-16 md:gap-y-20 lg:gap-y-6 lg:grid-cols-2 items-stretch">
          <div className="min-w-0 flex">
            <GitHubStats className="mt-0 h-full flex flex-col w-full" />
          </div>
          <div className="min-w-0 flex">
            <WakatimeStats className="mt-0 h-full flex flex-col w-full" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`text-center mt-20 ${
          entranceClass("animate-fade-in-up motion-reduce:animate-none")
        }`}
        style={{ animationDelay: "2.0s", animationFillMode: "both" }}
      >
        <Footer />
      </div>
    </PageShell>
  );
}

function normalizePath(path) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function getTilSlug(path) {
  return path.startsWith("/til/") ? path.slice("/til/".length) : null;
}

function rememberScrollPosition(scrollPositions, path, position) {
  scrollPositions.set(path, position);

  if (scrollPositions.size <= MAX_STORED_SCROLL_POSITIONS) {
    return;
  }

  const oldestPath = scrollPositions.keys().next().value;
  scrollPositions.delete(oldestPath);
}
