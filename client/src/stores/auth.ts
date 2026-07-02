import { defineStore } from 'pinia'
import { ref } from 'vue'

const API = '/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? '')
  const user = ref<any>(JSON.parse(localStorage.getItem('user') ?? 'null'))

  async function register(username: string, email: string, password: string, firstName?: string, lastName?: string) {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, firstName, lastName }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function fetchProfile() {
    if (!token.value) return
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    if (!res.ok) {
      logout()
      return
    }
    user.value = await res.json()
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  async function updateProfile(data: { firstName?: string; lastName?: string; email?: string; username?: string }) {
    const res = await fetch(`${API}/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    user.value = result
    localStorage.setItem('user', JSON.stringify(result))
    return result
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch(`${API}/auth/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, register, login, fetchProfile, updateProfile, changePassword, logout }
})
