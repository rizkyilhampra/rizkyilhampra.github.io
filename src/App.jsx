import {
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  FileText,
  Mail,
} from "lucide-react";
import { SocialLink } from "./SocialLink";
import { FloatingElements } from "./FloatingElements";
import { ThemeToggle } from "./ThemeToggle";
import { TypewriterText } from "./TypewriterText";
import Footer from "./Footer";

export default function App() {
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingElements />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div
          className="text-center mb-16 animate-fade-in-up motion-reduce:animate-none"
          style={{ animationFillMode: "both" }}
        >
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-30 animate-glow" />
            {/* <div className="relative w-32 h-32 bg-gradient-primary rounded-full mx-auto flex items-center justify-center shadow-glow"> */}
            {/*   <span className="text-4xl font-bold text-primary-foreground">RP</span> */}
            {/* </div> */}
          </div>

          <h1
            className="text-6xl md:text-7xl font-header font-semibold bg-gradient-primary bg-clip-text text-transparent mb-6 animate-scale-in motion-reduce:animate-none"
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
            className="w-24 h-1 bg-gradient-primary mx-auto rounded-full animate-scale-in motion-reduce:animate-none"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          />
        </div>

        {/* Links Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((link, index) => (
              <div
                key={link.href}
                className="animate-scale-in motion-reduce:animate-none"
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

        {/* Footer */}
        <div
          className="text-center mt-20 animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: "1.2s", animationFillMode: "both" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}
