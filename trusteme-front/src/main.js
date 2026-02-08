
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import api from './services/api'
import { CONFIG } from './config/environment'

async function applySiteMeta() {
  try {
    const { data } = await api.get('/site-content')
    if (data?.success) {
      const name = data.data['site_name'] || 'TrueConnect'
      const slogan = data.data['site_slogan'] || ''
      const desc = data.data['site_description'] || 'TrueConnect - Plataforma de acordos de consentimento com segurança jurídica'
      document.title = slogan ? `${name} - ${slogan}` : name
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', desc)
    }
  } catch (e) {
    // silencioso
  }
}

applySiteMeta()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
