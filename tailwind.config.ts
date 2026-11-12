import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        /* Neutral Base - 11 levels for comprehensive scaling */
        white: '#ffffff',
        black: '#000000',
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },

        soot: '#161210',
        plaster: '#EFE6D6',
        jasmine: '#F7F3EA',
        pomegranate: '#9C1C28',
        saffron: '#C9891A',
        copper: '#A65D32',
        tile: '#1F5C57',
        night: '#243056',
        disc: {
          dominant: '#9C1C28',
          influencer: '#C9891A',
          steady: '#1F5C57',
          conscientious: '#243056',
        },

        /* Semantic Colors - Always use meaningful color names */
        success: '#06a77d',
        warning: '#f1b24a',
        error: '#e63946',
        info: '#1f77b4',

        /* Interactive States */
        primary: {
          DEFAULT: '#1f77b4',
          light: '#e8f1ff',
          dark: '#0d47a1',
        },
        secondary: {
          DEFAULT: '#6c757d',
          light: '#f1f3f5',
          dark: '#343a40',
        },

        /* Utility */
        transparent: 'transparent',
        current: 'currentColor',
      },
      fontFamily: {
        sans: ['Figtree', 'Noto Sans Arabic', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Noto Naskh Arabic', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        /* Mobile Scale (Base) */
        xs: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.5px' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2rem', { lineHeight: '1.3' }],
        '5xl': ['2.5rem', { lineHeight: '1.2' }],
        '6xl': ['3rem', { lineHeight: '1.2' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.2',
        snug: '1.3',
        normal: '1.6',
        relaxed: '1.75',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '5rem',
        '5xl': '6rem',
        '6xl': '8rem',
      },
      borderRadius: {
        none: '0',
        xs: '0.25rem',
        sm: '0.5rem',
        base: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        base: '0 4px 6px rgba(0, 0, 0, 0.07)',
        md: '0 10px 15px rgba(0, 0, 0, 0.1)',
        lg: '0 20px 25px rgba(0, 0, 0, 0.1)',
        xl: '0 25px 50px rgba(0, 0, 0, 0.15)',
        '2xl': '0 50px 100px rgba(0, 0, 0, 0.2)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'fade-out': 'fade-out 300ms ease-in',
        'slide-down': 'slide-down 300ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'scale-in': 'scale-in 300ms ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      transitionDuration: {
        fast: '100ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 1, 0.4, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

