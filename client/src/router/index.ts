import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { guest: true } },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { guest: true } },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue'), meta: { guest: true } },
    { path: '/reset-password', name: 'reset-password', component: () => import('../views/ResetPasswordView.vue'), meta: { guest: true } },

    { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { auth: true } },
    { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { auth: true } },
    { path: '/matches', redirect: '/predictions' },
    { path: '/predictions', name: 'predictions', component: () => import('../views/PredictionsView.vue') },
    { path: '/standings', name: 'standings', component: () => import('../views/RankingView.vue') },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { auth: true, admin: true },
    },
    {
      path: '/admin/matches',
      name: 'admin-matches',
      component: () => import('../views/AdminMatchesView.vue'),
      meta: { auth: true, admin: true },
    },
    {
      path: '/admin/predictions',
      name: 'admin-predictions',
      component: () => import('../views/AdminPredictionsView.vue'),
      meta: { auth: true, admin: true },
    },
    {
      path: '/user/:userId/predictions',
      name: 'user-predictions',
      component: () => import('../views/UserPredictionsView.vue'),
      meta: { auth: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.auth && !auth.token) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.admin && auth.user?.role !== 'ADMIN') {
    return next({ name: 'dashboard' })
  }

  if (to.meta.guest && auth.token) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
