/* main.js */
// Huvudfil för Vue-applikationen - konfigurerar och startar appen

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// CSS-ramverk och styling
import 'bootstrap/dist/css/bootstrap.min.css'    // Bootstrap CSS-ramverk
import 'bootstrap-icons/font/bootstrap-icons.css' // Bootstrap ikoner
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // Bootstrap JavaScript-komponenter
import './assets/styles.css'                      // Anpassad global CSS

// Skapa Vue-appinstans och konfigurera plugins
const app = createApp(App)
const pinia = createPinia() // State management med Pinia

// Registrera plugins
app.use(pinia)  // State management
app.use(router) // Routing

// Starta applikationen
app.mount('#app')