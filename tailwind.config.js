import defaultTheme from "tailwindcss/defaultTheme";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        header: ["Iosevka", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-glow': 'var(--gradient-glow)'
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)'
      },
      transitionProperty: {
        'smooth': 'var(--transition-smooth)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-10px)' 
          }
        },
        'glow': {
          '0%, 100%': { 
            opacity: '1',
            filter: 'blur(0px)' 
          },
          '50%': { 
            opacity: '0.8',
            filter: 'blur(1px)' 
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'cursor-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        'float-slow': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)' 
          },
          '33%': { 
            transform: 'translateY(-15px) translateX(10px)' 
          },
          '66%': { 
            transform: 'translateY(10px) translateX(-5px)' 
          }
        },
        'float-medium': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px) rotate(0deg)' 
          },
          '50%': { 
            transform: 'translateY(-20px) translateX(15px) rotate(180deg)' 
          }
        },
        'float-fast': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)' 
          },
          '25%': { 
            transform: 'translateY(-12px) translateX(8px)' 
          },
          '75%': { 
            transform: 'translateY(8px) translateX(-12px)' 
          }
        },
        'drift-diagonal': {
          '0%': { 
            transform: 'translate(0px, 0px)' 
          },
          '100%': { 
            transform: 'translate(100px, -80px)' 
          }
        },
        'drift-reverse': {
          '0%': { 
            transform: 'translate(0px, 0px)' 
          },
          '100%': { 
            transform: 'translate(-120px, 100px)' 
          }
        },
        'drift-circular': {
          '0%': { 
            transform: 'translate(0px, 0px) rotate(0deg)' 
          },
          '25%': { 
            transform: 'translate(30px, -30px) rotate(90deg)' 
          },
          '50%': { 
            transform: 'translate(0px, -60px) rotate(180deg)' 
          },
          '75%': { 
            transform: 'translate(-30px, -30px) rotate(270deg)' 
          },
          '100%': { 
            transform: 'translate(0px, 0px) rotate(360deg)' 
          }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.4',
            transform: 'scale(1)' 
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.1)' 
          }
        },
        'bounce-subtle': {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-8px)' 
          }
        },
        'glow-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'fade-in-float': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) translateX(0px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0px) translateX(0px)'
          }
        },
        'scale-in-float': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8) translateY(0px) translateX(0px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0px) translateX(0px)'
          }
        },
        'position-shift-slow': {
          '0%, 25%': { transform: 'translate(0px, 0px)' },
          '50%, 75%': { transform: 'translate(50px, -30px)' },
          '100%': { transform: 'translate(0px, 0px)' }
        },
        'position-shift-medium': {
          '0%, 20%': { transform: 'translate(0px, 0px)' },
          '40%, 60%': { transform: 'translate(-40px, 60px)' },
          '80%, 100%': { transform: 'translate(20px, -20px)' }
        },
        'float-organic-1': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px) rotate(0deg)' 
          },
          '25%': { 
            transform: 'translateY(-8px) translateX(6px) rotate(2deg)' 
          },
          '50%': { 
            transform: 'translateY(-15px) translateX(-4px) rotate(-1deg)' 
          },
          '75%': { 
            transform: 'translateY(-5px) translateX(10px) rotate(3deg)' 
          }
        },
        'float-organic-2': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px) rotate(0deg)' 
          },
          '33%': { 
            transform: 'translateY(-12px) translateX(-8px) rotate(-2deg)' 
          },
          '66%': { 
            transform: 'translateY(8px) translateX(12px) rotate(1.5deg)' 
          }
        },
        'float-organic-3': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px) rotate(0deg)' 
          },
          '20%': { 
            transform: 'translateY(-6px) translateX(4px) rotate(1deg)' 
          },
          '40%': { 
            transform: 'translateY(-18px) translateX(-6px) rotate(-2.5deg)' 
          },
          '60%': { 
            transform: 'translateY(-10px) translateX(8px) rotate(1.5deg)' 
          },
          '80%': { 
            transform: 'translateY(2px) translateX(-3px) rotate(-0.5deg)' 
          }
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'scale-in': 'scale-in 0.6s ease-out',
        'cursor-blink': 'cursor-blink 1s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-medium': 'float-medium 6s ease-in-out infinite',
        'float-fast': 'float-fast 4s ease-in-out infinite',
        'drift-diagonal': 'drift-diagonal 25s linear infinite',
        'drift-reverse': 'drift-reverse 30s linear infinite',
        'drift-circular': 'drift-circular 20s linear infinite',
        'spin-slow': 'spin-slow 15s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'glow-slow': 'glow-slow 6s ease-in-out infinite',
        'fade-in-float': 'fade-in-float 0.8s ease-out forwards',
        'scale-in-float': 'scale-in-float 0.6s ease-out forwards',
        'position-shift-slow': 'position-shift-slow 45s ease-in-out infinite',
        'position-shift-medium': 'position-shift-medium 35s ease-in-out infinite',
        'float-organic-1': 'float-organic-1 7s ease-in-out infinite',
        'float-organic-2': 'float-organic-2 9s ease-in-out infinite',
        'float-organic-3': 'float-organic-3 5.5s ease-in-out infinite'
      }
    },
  },
  plugins: [
    require("@catppuccin/tailwindcss")({
      defaultFlavour: "latte",
    }),
    require("tailwindcss-animate"),
  ],
};
