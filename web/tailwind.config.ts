import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#365b45',
        primaryDark: '#233f30',
        primarySoft: '#e9ece1',
        canvas: '#f5f3ed',
        paper: '#fffefa',
        ink: '#20342f',
        muted: '#68716b',
        line: '#dcded3',
        success: '#16a34a',
        warning: '#ea580c',
        violet: '#9333ea',
        teal: '#0d9488',
        darkCanvas: '#16211e',
        darkPanel: '#1a2822',
        darkCard: '#1d2b26',
        darkLine: '#35453b',
        darkInk: '#e6e9dc',
        darkMuted: '#afb8ab'
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        label: ['Manrope', 'system-ui', 'sans-serif']
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
