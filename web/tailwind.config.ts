import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0075d9',
        primaryDark: '#005bba',
        primarySoft: '#f0f7ff',
        canvas: '#f5f5f5',
        paper: '#ffffff',
        ink: '#111827',
        muted: '#666666',
        line: '#e5e7eb',
        success: '#16a34a',
        warning: '#ea580c',
        violet: '#9333ea',
        teal: '#0d9488',
        darkCanvas: '#0b1326',
        darkPanel: '#131b2e',
        darkCard: '#171f33',
        darkLine: '#2d3449',
        darkInk: '#dae2fd',
        darkMuted: '#c2c6d6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Public Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '0.75rem',
        soft: '1rem'
      },
      boxShadow: {
        stitch: '0 1px 2px rgba(15, 23, 42, 0.08)',
        glow: '0 20px 50px rgba(0, 102, 204, 0.14)'
      },
      maxWidth: {
        shell: '1280px'
      }
    }
  },
  plugins: []
};

export default config;
