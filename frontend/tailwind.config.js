/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121215',
        card: '#18181b',
        border: '#27272a',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        youtube: {
          red: '#ff0000',
          dark: '#cc0000',
        },
        instagram: {
          pink: '#e1306c',
          purple: '#833ab4',
          orange: '#f56040',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(255, 0, 0, 0.3)',
        'glow-pink': '0 0 25px -5px rgba(225, 48, 108, 0.3)',
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
};
