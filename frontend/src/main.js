import './assets/tailwind.css';
import 'primeicons/primeicons.css';
import '@/assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import App from './App.vue';
import router from './router';
import ToastService from 'primevue/toastservice';



const app = createApp(App);

app.use(createPinia());
app.use(router);


app.use(PrimeVue, {
   unstyled: false,
   theme: {
      preset: Aura,
      options: {
         darkModeSelector: '.tw-dark',
      },
   },
   screens:{
   },
    zIndex: {
    toast: 10000,
  },
});

app.use(ToastService);
// app.use(VueSignature);

app.mount('#app');
