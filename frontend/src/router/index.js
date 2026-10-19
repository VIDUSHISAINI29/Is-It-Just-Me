import { createRouter, createWebHistory, useRouter } from 'vue-router';


const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   scrollBehavior(to, from, savedPosition) {
      // Always scroll to top on navigation
      return { top: 0 };
   },
   routes: [
      {
         path: '/',
         redirect: '/home',
      },
      {
         path: '/',
         component: () => import('@/layout/AppLayout.vue'),
         // beforeEnter: authGuard,
         children: [
            {
               path: '/home',
               name: 'home',
               component: () => import('@/pages/home/Homepage.vue'),
            //    children: [
            //       {
            //          path: ':uri',
            //          name: 'homeContent',
            //          component: () => import('@/pages/home/Content.vue'),
            //          props: true,
            //       },
            //    ],
            },
            
           
         ],
      },
  
   ],
});

export default router;
