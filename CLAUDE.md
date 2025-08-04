# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio/landing page built with React and Farm.js, deployed to GitHub Pages. It features a modern, animated design with floating elements, theme switching, and enhanced visual effects inspired by canvas-transform-lab.

## Development Commands

- **Install dependencies**: `bun install`
- **Start development server**: `bun run dev` or `bun run start`
- **Build for production**: `bun run build`
- **Preview production build**: `bun run preview`
- **Clean build artifacts**: `bun run clean`

## Architecture

- **Build Tool**: Farm.js (modern Rust-based bundler)
- **Framework**: React 18 with JSX
- **Styling**: Tailwind CSS with enhanced Catppuccin theme (light/dark mode support)
- **Icons**: Lucide React for modern iconography
- **Typography**: Inter (body text) and Iosevka (headers) loaded via @fontsource
- **Structure**: Modern component-based architecture with animations
  - `App.jsx`: Main component with animated layout and social links
  - `SocialLink.jsx`: Enhanced link cards with icons and hover effects
  - `FloatingElements.jsx`: Animated background elements
  - `ThemeToggle.jsx`: Dark/light mode switcher
  - `LinkList.jsx`: Reusable link component with design system colors
  - `Footer.jsx`: Footer component with themed links
  - `index.jsx`: React app entry point

## Dependencies

- **lucide-react**: Modern icon library
- **tailwindcss-animate**: Enhanced animations and transitions
- **clsx**: Conditional class management utility
- **@fontsource/inter**: Inter font for body text (weights: 300, 400, 500)
- **@fontsource/iosevka**: Iosevka font for headers (weights: 500, 600)

## Key Configuration

- **Farm.js**: Configured with PostCSS plugin and React plugin with automatic runtime
- **Tailwind**: Enhanced with custom animations, design tokens, typography, and dark mode support
  - Custom animations: float, glow, fade-in-up, scale-in
  - Design system colors with CSS custom properties
  - Catppuccin color palette for both light (latte) and dark (mocha) themes
  - Font families: `font-sans` (Inter for body), `font-header` (Iosevka for headers)
- **PostCSS**: Configured with Autoprefixer for CSS compatibility
- **Theme System**: CSS custom properties with light/dark mode switching

## Development Notes

- Uses modern ES modules (`type: "module"` in package.json)
- React components use function syntax with modern hooks patterns
- Tailwind classes follow responsive design patterns (sm:, md:, lg:)
- Enhanced design system with CSS custom properties for theming
- Animation system with staggered delays and proper fill modes
- Theme persistence using localStorage
- Responsive grid layout for social links (md:grid-cols-2 lg:grid-cols-3)

## Design System Colors

### Light Mode (Latte)
- Primary: `hsl(266 85% 58%)` (mauve)
- Background: `hsl(220 23% 95%)` (base)
- Foreground: `hsl(234 16% 35%)` (text)

### Dark Mode (Mocha)  
- Primary: `hsl(267 84% 81%)` (mauve)
- Background: `hsl(240 21% 15%)` (base)
- Foreground: `hsl(226 64% 88%)` (text)

## Implementation Notes

- **Typography Strategy**: 
  - Header Font: Iosevka (main name "Rizky Ilham Pratama" uses `font-header` class)
  - Body Font: Inter (all other text elements use default `font-sans`)
  - Weight hierarchy: Light (300), Regular (400), Medium (500), SemiBold (600)
- **LinkList component**: Uses `text-primary` for theme-aware link colors instead of hardcoded blue
- **Animation delays**: Use `animationFillMode: 'both'` to prevent flickering during staggered animations
- **Theme toggle**: Manually manages theme state and DOM classes for Farm.js compatibility
- **Floating elements**: Positioned absolutely with different animation delays for organic movement