import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      vue({
         template: {
            compilerOptions: {
               // treat all tags with a dash as custom elements
               isCustomElement: (tag) => tag.includes('qlik-'),
            },
         },
      }),
      viteCompression(),
      Components({
         resolvers: [PrimeVueResolver()],
      }),
   ],
   resolve: {
      alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
   },
   server: {
      port: 5175,
   },
});
