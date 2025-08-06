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

## Development Notes

- Uses modern ES modules (`type: "module"` in package.json)
- React components use function syntax with modern hooks patterns
- Tailwind classes follow responsive design patterns (sm:, md:, lg:)
- Enhanced design system with CSS custom properties for theming
- Animation system with staggered delays and proper fill modes
- Theme persistence using localStorage
- Responsive grid layout for social links (md:grid-cols-2 lg:grid-cols-3)
- Don't need to test and run `bun run dev`

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
- **Floating elements**: Enhanced animation system with organic movement and mobile optimization
  - **Organic animations**: Custom `float-organic-1/2/3` keyframes with subtle rotation (1-3deg) and multi-directional movement
  - **Responsive scaling**: Elements scale down on mobile (`w-8 sm:w-12`, `blur-sm sm:blur-md`) for better performance
  - **Reduced opacity on mobile**: Lower opacity values on small screens to reduce visual weight
  - **Motion-reduce compliance**: All animations disabled with `motion-reduce:animate-none` for accessibility
  - **Nested div architecture**: Separates entrance animations (outer) from continuous movement (inner) to prevent CSS conflicts
  - **Flicker-free loops**: Only seamless infinite animations used, avoiding position jumps at keyframe boundaries
  - **Performance optimized**: Uses CSS transforms and opacity for hardware acceleration, no layout thrashing