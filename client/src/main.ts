import './assets/base.css'
import 'flag-icons/css/flag-icons.min.css'
import 'vue-sonner/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { toast } from 'vue-sonner'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Make toast available globally for views that import from socket
export { toast }
