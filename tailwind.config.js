/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5EFE6',
        foreground: '#203129',
        muted: '#EEE4D5',
        'muted-foreground': '#5C675E',
        accent: '#5C7C6C',
        'accent-secondary': '#B56B4A',
        border: '#D8CDBB',
        card: '#FEFBF6',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(71, 58, 41, 0.10)',
        accent: '0 14px 34px rgba(92, 124, 108, 0.22)',
        hover: '0 24px 60px rgba(71, 58, 41, 0.16)',
      },
    },
  },
  plugins: [],
};
