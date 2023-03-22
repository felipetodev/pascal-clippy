/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        clippy: 'radial-gradient(at center center, rgb(55, 65, 81), rgb(17, 24, 39), rgb(0, 0, 0))'
      }
    }
  },
  plugins: [require('@headlessui/tailwindcss')]
}
