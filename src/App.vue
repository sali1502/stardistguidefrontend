<!-- App.vue -->
<!-- Rotkomponent för Vue-applikationen - hanterar routing och autentiseringsinitiering -->

<template>
  <div id="app">
    <!-- Router outlet för alla sidkomponenter -->
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Initiera authstore för global autentiseringshantering
const authStore = useAuthStore()

// Återställ autentiseringsstatus vid appstart
onMounted(() => {
  // Kontrollera och återställ inloggningsstatus från localStorage
  authStore.initializeAuth()
})
</script>

<style>
/* Styling för hela applikationen */
#app {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}
</style>

