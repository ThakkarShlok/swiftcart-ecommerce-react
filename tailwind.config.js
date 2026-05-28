// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7fb',
          100: '#d9e1eb',
          200: '#b7c7db',
          300: '#95afca',
          400: '#697f9f',
          500: '#2B3440',
          600: '#283342',
          700: '#1f2a38',
          800: '#181f2b',
          900: '#141b27',
          950: '#0f141d',
        },
        surface: {
          50: '#f8fafb',
          100: '#f2f4f7',
          200: '#e8ecf2',
          300: '#dfe4eb',
          500: '#cfd8e2',
        },
        sapphire: {
          50: '#eef5ff',
          100: '#dbe9ff',
          200: '#b8d4ff',
          500: '#4363d5',
          600: '#3953b8',
          700: '#2e4392',
        },
        teal: {
          50: '#fff2e8',
          100: '#ffd7c5',
          200: '#ffb890',
          300: '#ff935d',
          500: '#FF5A1F',
          600: '#e24f1a',
          700: '#b44315',
          800: '#883210',
          900: '#61220a',
        },
        copper: {
          50: '#e7f5ed',
          100: '#c7ead8',
          200: '#aae0c4',
          300: '#5bca95',
          400: '#3fa16d',
          500: '#00875A',
          600: '#00714a',
          700: '#005c3e',
          800: '#044b34',
          900: '#033a29',
        },
        primary: {
          50: '#fff2e8',
          100: '#ffd7c5',
          200: '#ffb890',
          300: '#ff935d',
          400: '#ff7b39',
          500: '#FF5A1F',
          600: '#e24f1a',
          700: '#b44315',
          800: '#883210',
          900: '#61220a',
        },
        accent: {
          500: '#2B3440',
          600: '#262f3d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
