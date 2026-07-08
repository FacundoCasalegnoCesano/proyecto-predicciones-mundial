import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? '')
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') ?? 'null'))

  async function register(username: string, email: string, password: string, firstName?: string, lastName?: string) {
    const data = await api.post<{ token: string; user: User }>('/auth/register', {
      username,
      email,
      password,
      firstName,
      lastName,
    })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function login(email: string, password: string) {
    const data = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const profile = await api.get<User>('/auth/me')
      user.value = profile
      localStorage.setItem('user', JSON.stringify(profile))
    } catch {
      logout()
    }
  }

  async function updateProfile(data: { firstName?: string; lastName?: string; email?: string; username?: string }) {
    const result = await api.patch<User>('/auth/profile', data)
    user.value = result
    localStorage.setItem('user', JSON.stringify(result))
    return result
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await api.patch('/auth/password', { currentPassword, newPassword })
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, register, login, fetchProfile, updateProfile, changePassword, logout }
})
