/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0B0E14',
          surface: '#10141C',
          'surface-alt': '#161B26'
        },
        border: {
          hairline: '#1E2530'
        },
        text: {
          primary: '#D6DAE3',
          secondary: '#7A8194',
          disabled: '#454B58'
        },
        market: {
          bid: '#00C896',
          'bid-bg': 'rgba(0, 200, 150, 0.08)',
          ask: '#F5455C',
          'ask-bg': 'rgba(245, 69, 92, 0.08)'
        },
        accent: '#3E7CFF',
        warn: '#F5A623',
        btn: {
          buy: '#00A87E',
          'buy-hover': '#00C896',
          sell: '#E6394F',
          'sell-hover': '#F5455C'
        }
      },
      borderRadius: {
        panel: '4px'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
};

