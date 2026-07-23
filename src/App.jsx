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
import { lazy, Suspense, useRef, useState } from "react";
import { useMountEffect } from "./useMountEffect";
import { ProjectList } from "./SocialLink";
import { SectionHeading } from "./SectionHeading";
import { SocialIconRow } from "./SocialIconRow";
import { TypewriterText } from "./TypewriterText";
import { ScrambleText } from "./ScrambleText";
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
import { NotFoundPage } from "./NotFoundPage";
import { PageShell } from "./PageShell";
import { TilNotePage, prefetchTilNotePage } from "./tilNotePageLoader";
import { TilNotePage as PrerenderedTilNotePage } from "./TilNotePage";
import { loadTilManifest } from "./tilNotes";
import {
  applyRouteMetadata,
  getRouteMetadata,
  normalizePath,
  resolveRoute,
} from "./routeMetadata";
import { createReveal } from "./entrance";
import { SITE } from "./siteConfig.js";

const LocationMap = lazy(() => import("./LocationMap"));

const MAX_STORED_SCROLL_POSITIONS = 20;

function useStaticRender(prerender) {
  const [hydrated, setHydrated] = useState(false);
  useMountEffect(() => {
    setHydrated(true);
  });
  return prerender && !hydrated;
}

export default function App({ initialPath, routeData, prerender = false } = {}) {
  const isStaticRender = useStaticRender(prerender);
  const [path, setPath] = useState(() =>
    normalizePath(initialPath ?? window.location.pathname ?? "/")
  );
  const [skipEntranceAnimation, setSkipEntranceAnimation] = useState(false);
  const currentPathRef = useRef(path);
  const prerenderedPathRef = useRef(
    routeData?.path ? normalizePath(routeData.path) : null
  );
  const activeRouteData =
    routeData && path === prerenderedPathRef.current ? routeData : undefined;
  const scrollPositionsRef = useRef(new Map());
  // Tracks how deep we are in this app's own history stack so the back button
  // knows whether going back stays in-app (vs leaving the site on a deep link).
  const historyIndexRef = useRef(0);

  useMountEffect(() => {
    const originalScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

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
      applyRouteForPath(nextPath, routeData);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.history.scrollRestoration = originalScrollRestoration;
      window.removeEventListener("popstate", handlePopState);
    };
  });

  useMountEffect(() => {
    const schedule = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = schedule(() => prefetchTilNotePage());
    return () => cancel(handle);
  });

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
    applyRouteForPath(nextPath, routeData);
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

  const route = resolveRoute(path);
  const isTilIndex = route.type === "til-index";
  const isTilTagsIndex = route.type === "tags-index";
  const tilTag = route.type === "tag" ? route.tag : null;
  const tilSlug = route.type === "note" ? route.slug : null;
  const reveal = createReveal(skipEntranceAnimation);

  const applyRouteForPath = (routePath, rdata) => {
    const resolved = resolveRoute(routePath);
    const notes = rdata?.notes ?? [];
    const tags = rdata?.tags ?? [];
    let note = rdata?.note;
    if (note && note.slug !== resolved.slug) note = undefined;

    const setMetadata = (allNotes) => {
      if (!note && resolved.type === "note" && resolved.slug) {
        note = allNotes.find((n) => n.slug === resolved.slug);
      }
      applyRouteMetadata(
        getRouteMetadata(routePath, { notes: allNotes, tags, note })
      );
    };

    setMetadata(notes);

    if (resolved.type === "note" && resolved.slug && !note) {
      loadTilManifest().then(setMetadata).catch(() => {});
    }
  };

  useMountEffect(() => {
    applyRouteForPath(path, routeData);
  });

  if (isTilIndex) {
    return (
      <Suspense fallback={null}>
        <TilIndexPage
          onNavigate={navigate}
          onBack={goBack}
          skipEntranceAnimation={skipEntranceAnimation}
          notes={activeRouteData?.notes}
          tags={activeRouteData?.tags}
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
          tags={activeRouteData?.tags}
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
          notes={activeRouteData?.notes}
        />
      </Suspense>
    );
  }

  if (tilSlug) {
    const noteProps = {
      slug: tilSlug,
      onNavigate: navigate,
      onBack: goBack,
      skipEntranceAnimation,
    };

    if (activeRouteData?.note) {
      return (
        <PrerenderedTilNotePage
          key={tilSlug}
          {...noteProps}
          note={activeRouteData.note}
          notes={activeRouteData.notes}
        />
      );
    }

    return (
      <Suspense fallback={null}>
        <TilNotePage key={tilSlug} {...noteProps} />
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
          <ScrambleText
            text="Rizky Ilham Pratama"
            skip={skipEntranceAnimation}
          />
        </h1>

        <div className="mt-3 text-lg text-muted-foreground sm:text-xl">
          <TypewriterText
            texts={SITE.typewriterTexts}
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

        {isStaticRender ? (
          <div
            className="mt-6 h-40 w-full rounded-lg border border-border bg-secondary/40 sm:h-44 md:w-1/2"
            aria-label="Location map available after the page loads"
          />
        ) : (
          <Suspense
            fallback={
              <div className="mt-6 h-40 w-full animate-pulse rounded-lg border border-border bg-secondary sm:h-44 md:w-1/2" />
            }
          >
            <LocationMap />
          </Suspense>
        )}
      </section>

      <SectionDivider />

      {/* Projects */}
      {/* <section {...reveal(1)}> */}
      {/*   <SectionHeading eyebrow="~/projects" title="Projects"> */}
      {/*     Things I’ve built and keep running. */}
      {/*   </SectionHeading> */}
      {/*   <ProjectList items={projects} /> */}
      {/* </section> */}
      {/**/}
      {/* <SectionDivider /> */}

      {/* Today I Learned (digital garden) */}
      <section {...reveal(2)}>
        <TilListPreview
          onNavigate={navigate}
          skipEntranceAnimation={skipEntranceAnimation}
          notes={activeRouteData?.notes}
        />
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

function rememberScrollPosition(scrollPositions, path, position) {
  scrollPositions.set(path, position);

  if (scrollPositions.size <= MAX_STORED_SCROLL_POSITIONS) {
    return;
  }

  const oldestPath = scrollPositions.keys().next().value;
  scrollPositions.delete(oldestPath);
}
