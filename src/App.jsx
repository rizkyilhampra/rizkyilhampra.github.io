import { Github, Instagram, Linkedin, Twitter, Globe, FileText } from "lucide-react";
import { SocialLink } from "./SocialLink";
import { FloatingElements } from "./FloatingElements";
import { ThemeToggle } from "./ThemeToggle";
import { TypewriterText } from "./TypewriterText";
import Footer from "./Footer";

export default function App() {
  const socialLinks = [
    {
      href: "https://spdhtc.rizkyilhampra.dev",
      icon: Globe,
      label: "SPDHTC",
      description: "Another app I made"
    },
    {
      href: "https://blog.rizkyilhampra.dev",
      icon: FileText,
      label: "Blog",
      description: "Thoughts and tutorials"
    },
    {
      href: "https://github.com/rizkyilhampra",
      icon: Github,
      label: "GitHub",
      description: "Open source projects and code"
    },
    {
      href: "https://instagram.com/rizkyilhampra",
      icon: Instagram,
      label: "Instagram",
      description: "Life updates and moments"
    },
    {
      href: "https://x.com/rizkyilhampra",
      icon: Twitter,
      label: "X (Twitter)",
      description: "Quick thoughts and updates"
    },
    {
      href: "https://www.linkedin.com/in/rizkyilhampra",
      icon: Linkedin,
      label: "LinkedIn",
      description: "Professional network"
    }
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
        <div className="text-center mb-16 animate-fade-in-up" style={{ animationFillMode: 'both' }}>
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-30 animate-glow" />
            {/* <div className="relative w-32 h-32 bg-gradient-primary rounded-full mx-auto flex items-center justify-center shadow-glow"> */}
            {/*   <span className="text-4xl font-bold text-primary-foreground">RP</span> */}
            {/* </div> */}
          </div>
          
          <h1 className="text-6xl md:text-7xl font-header font-semibold bg-gradient-primary bg-clip-text text-transparent mb-6 animate-scale-in" style={{ 
            animationDelay: '0.1s',
            animationFillMode: 'both' 
          }}>
            Rizky Ilham Pratama
          </h1>
          
          <div className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 min-h-[4rem] sm:min-h-[3rem] md:min-h-[4rem] flex items-center justify-center">
            <TypewriterText 
              texts={[
                "Developer, Creator, and Digital Enthusiast",
                "Building digital experiences with passion and precision",
                "Turning ideas into interactive solutions",
                "Use VIM and Arch Linux BTW"
              ]}
              typingSpeed={100}
              deletingSpeed={60}
              pauseDuration={3000}
            />
          </div>
          
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full animate-scale-in" style={{ 
            animationDelay: '0.2s',
            animationFillMode: 'both' 
          }} />
        </div>

        {/* Links Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((link, index) => (
              <div 
                key={link.href} 
                className="animate-scale-in"
                style={{ 
                  animationDelay: `${0.3 + index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <SocialLink {...link} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 animate-fade-in-up" style={{ 
          animationDelay: '1.2s',
          animationFillMode: 'both' 
        }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
