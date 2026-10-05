/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Neutral Industrial palette (from src/aesthetic/spec.ts) ---
        'charcoal-black': '#1C1E1F',
        'graphite-grey': '#3E4144',
        'steel-blue': '#4A5A66',
        'concrete-grey': '#8C8F8A',
        'fog-white': '#DCDCD8',
        'safety-orange': '#FF5A1F',
        // --- Semantic aliases ---
        background: '#1C1E1F',
        surface: '#3E4144',
        'text-primary': '#DCDCD8',
        'text-secondary': '#8C8F8A',
        'accent-cool': '#4A5A66',
        'accent-sharp': '#FF5A1F',
      },
      fontFamily: {
        body: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tight: '-0.02em',
        label: '0.05em',
        title: '0.03em',
      },
      opacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
        85: '0.85',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
