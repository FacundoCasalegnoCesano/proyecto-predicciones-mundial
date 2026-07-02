import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
    { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
    { path: '/matches', name: 'matches', component: () => import('../views/MatchesView.vue') },
    { path: '/predictions', name: 'predictions', component: () => import('../views/PredictionsView.vue') },
    { path: '/standings', name: 'standings', component: () => import('../views/RankingView.vue') },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') },
    { path: '/admin/matches', name: 'admin-matches', component: () => import('../views/AdminMatchesView.vue') },
    { path: '/admin/predictions', name: 'admin-predictions', component: () => import('../views/AdminPredictionsView.vue') },
    { path: '/user/:userId/predictions', name: 'user-predictions', component: () => import('../views/UserPredictionsView.vue') },
  ],
})

export default router
