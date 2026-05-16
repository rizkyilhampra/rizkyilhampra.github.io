import {
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  FileText,
  Mail,
} from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { SocialLink } from "./SocialLink";
import { TypewriterText } from "./TypewriterText";
import Footer from "./Footer";
import GitHubStats from "./GitHubStats";
import MonkeytypeStats from "./MonkeytypeStats";
import SpotifyStats from "./SpotifyStats";
import WakatimeStats from "./WakatimeStats";
import { InternalHomeLink } from "./InternalHomeLink";
import { LatestPostPreview } from "./LatestPostPreview";
import { PageShell } from "./PageShell";
import { findPostBySlug, latestPosts } from "./blogPosts";

const BlogPostPage = lazy(() =>
  import("./BlogPostPage").then((module) => ({
    default: module.BlogPostPage,
  }))
);

const MAX_STORED_SCROLL_POSITIONS = 20;

export default function App() {
  const [path, setPath] = useState(() =>
    normalizePath(window.location.pathname || "/")
  );
  const [skipEntranceAnimation, setSkipEntranceAnimation] = useState(false);
  const currentPathRef = useRef(path);
  const scrollPositionsRef = useRef(new Map());

  useEffect(() => {
    const originalScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const handlePopState = () => {
      rememberScrollPosition(
        scrollPositionsRef.current,
        currentPathRef.current,
        window.scrollY
      );

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
      window.history.pushState({}, "", nextPath);
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

  const blogSlug = getBlogSlug(path);
  const currentPost = blogSlug ? findPostBySlug(blogSlug) : null;
  const entranceClass = (className) =>
    skipEntranceAnimation ? "" : className;

  useEffect(() => {
    if (path === "/") {
      document.title = "Rizky Ilham Pratama";
      return;
    }

    if (blogSlug) {
      document.title = currentPost
        ? `${currentPost.title} | Rizky Ilham Pratama`
        : "Post not found | Rizky Ilham Pratama";
      return;
    }

    document.title = "Page not found | Rizky Ilham Pratama";
  }, [blogSlug, currentPost, path]);

  if (blogSlug) {
    if (currentPost) {
      return (
        <Suspense fallback={null}>
          <BlogPostPage
            post={currentPost}
            skipEntranceAnimation={skipEntranceAnimation}
            onNavigateHome={navigateHome}
          />
        </Suspense>
      );
    }

    return (
      <NotFoundPage
        skipEntranceAnimation={skipEntranceAnimation}
        onNavigateHome={navigateHome}
      />
    );
  }

  if (path !== "/") {
    return (
      <NotFoundPage
        skipEntranceAnimation={skipEntranceAnimation}
        onNavigateHome={navigateHome}
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

      <div
        className={`max-w-6xl mx-auto ${
          entranceClass("animate-fade-in-up motion-reduce:animate-none")
        }`}
        style={{ animationDelay: "0.9s", animationFillMode: "both" }}
      >
        <LatestPostPreview posts={latestPosts} onNavigate={navigate} />
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

function getBlogSlug(path) {
  return path.startsWith("/blog/") ? path.slice("/blog/".length) : null;
}

function rememberScrollPosition(scrollPositions, path, position) {
  scrollPositions.set(path, position);

  if (scrollPositions.size <= MAX_STORED_SCROLL_POSITIONS) {
    return;
  }

  const oldestPath = scrollPositions.keys().next().value;
  scrollPositions.delete(oldestPath);
}

function NotFoundPage({ onNavigateHome, skipEntranceAnimation }) {
  const entranceClass = skipEntranceAnimation
    ? ""
    : "animate-fade-in-up motion-reduce:animate-none";

  return (
    <PageShell mainClassName="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-6 py-20">
      <section className={`max-w-xl text-center ${entranceClass}`}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
          404
        </p>
        <h1 className="font-header text-4xl font-semibold text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          The page you opened does not exist on this site.
        </p>
        <InternalHomeLink onNavigateHome={onNavigateHome} className="mt-8" />
      </section>
    </PageShell>
  );
}
