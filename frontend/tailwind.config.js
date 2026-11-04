/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Soft primary green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warm: {
          50: '#FDFCFA',
          100: '#FAF9F6', // Warm white base background
          200: '#F3F1EC',
          300: '#E7E4DC',
          400: '#D3CEC2',
        },
        expense: '#EF4444',
        income: '#10B981',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        'mic': '0 0 0 8px rgba(16, 185, 129, 0.2), 0 10px 25px -5px rgba(16, 185, 129, 0.4)',
        'mic-active': '0 0 0 16px rgba(239, 68, 68, 0.25), 0 10px 30px -5px rgba(239, 68, 68, 0.5)',
      }
    },
  },
  plugins: [],
}

