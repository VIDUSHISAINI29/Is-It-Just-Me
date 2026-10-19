
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior() {
    return { top: 0 }
  },

  routes: [
    {
      path: '/',
      component: () => import('@/layout/AppLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/home',
        },
        {
          path: 'home',
          name: 'home',
          component: () => import('@/pages/home/Homepage.vue'),
        },
        {
          path: 'privacy',
          name: 'privacyPolicy',
          component: () => import('@/pages/PrivacyPolicy.vue'),
        },
        {
          path: 'terms',
          name: 'terms',
          component: () => import('@/pages/Terms.vue'),
        },
      ],
    },
  ],
})

export default router
