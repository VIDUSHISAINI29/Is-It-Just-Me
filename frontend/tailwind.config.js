/** @type {import('tailwindcss').Config} */
export default {
   important: true,
   darkMode: 'class',
   content: [
      './index.html',
      "./src/**/*.{vue,js,ts,jsx,tsx}",
      './vueform.config.js', // or where `vueform.config.js` is located. Change `.js` to `.ts` if required.
      './node_modules/@vueform/vueform/themes/tailwind/**/*.vue',
      './node_modules/@vueform/vueform/themes/tailwind/**/*.js',
   ],
   theme: {
      extend: {
         boxShadow: {
            custom: '0 8px 30px rgba(0, 0, 0, 0.12)', // Custom shadow
         },
         colors: {
            uspaBlue: '#13294b', // Example custom blue color
            uspaRed: '#a12338', // Example custom gray color
            poloGreen: '#143227',
         },
      },
   },
   plugins: [require('tailwindcss-primeui')],
   prefix: 'tw-',
};
