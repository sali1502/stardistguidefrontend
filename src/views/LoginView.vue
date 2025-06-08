<!-- views/LoginView.vue - Vy för att logga in -->

<template>
  <div class="login-container">
    <!-- Sidhuvud med logotyp och applikationsnamn -->
    <div class="login-header">
      <div class="container">
        <div class="d-flex align-items-center">
          <div class="logo">
            <img src="@/assets/images/logo.png" alt="Logotyp" class="logo-image me-2" />
            Guide för webbtillgänglighet
          </div>
        </div>
      </div>
    </div>

    <!-- Huvudinnehåll med inloggningsformulär -->
    <div class="login-content">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
            <div class="login-card">
              <div class="login-card-header">
                <h2 class="login-title">Logga in</h2>
              </div>

              <form @submit.prevent="handleLogin" class="login-form" novalidate>
                <!-- Inmatning i formulär av användarnamn med validering -->
                <div class="form-group">
                  <label for="username" class="form-label">Användarnamn</label>
                  <input id="username" v-model="form.username" type="text" class="form-control"
                    :class="{ 'is-invalid': errors.username }" placeholder="Ange ditt användarnamn" required
                    :disabled="loading" @input="clearFieldErrors" autocomplete="username" />
                  <div v-if="errors.username" class="invalid-feedback">
                    {{ errors.username }}
                  </div>
                </div>

                <!-- Inmatning i formulär av lösenord med validering -->
                <div class="form-group">
                  <label for="password" class="form-label">Lösenord</label>
                  <input id="password" v-model="form.password" type="password" class="form-control"
                    :class="{ 'is-invalid': errors.password }" placeholder="Ange ditt lösenord" :disabled="loading"
                    @input="clearFieldErrors" autocomplete="current-password" />
                  <div v-if="errors.password" class="invalid-feedback">
                    {{ errors.password }}
                  </div>
                </div>

                <!-- Felmeddelande från server eller nätverksproblem -->
                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  {{ errorMessage }}
                </div>

                <!-- Inloggningsknapp med laddningsindikator -->
                <button type="submit" class="btn btn-primary w-100" :disabled="loading || !isFormValid">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Laddar...</span>
                  </span>
                  {{ loading ? 'Loggar in...' : 'Logga in' }}
                </button>
              </form>

              <!-- Informationstext för nya användare -->
              <div class="login-footer">
                <small class="text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Kontakta administratören för att få ett konto
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Applikationens sidfot -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppFooter from '@/components/AppFooter.vue'

const authStore = useAuthStore()

// Reaktiv formulärdata för användarinput
const form = ref({
  username: '',
  password: ''
})

// Valideringsfel för respektive formulärfält
const errors = ref({
  username: null,
  password: null
})

// Allmänt felmeddelande från server eller autentiseringsfel
const errorMessage = ref('')

// Laddningsstatus under inloggningsprocess
const loading = ref(false)

// Kontrollera om formuläret är korrekt ifyllt och giltigt
const isFormValid = computed(() => {
  return form.value.username.trim() &&
    form.value.password.trim() &&
    !errors.value.username &&
    !errors.value.password
})

// Frontend-validering av formulärfält
const validateForm = () => {
  // Återställ alla valideringsfel
  errors.value = {
    username: null,
    password: null
  }

  // Validera användarnamn
  if (!form.value.username.trim()) {
    errors.value.username = 'Användarnamn är obligatoriskt'
  } else if (form.value.username.length < 3) {
    errors.value.username = 'Användarnamnet måste vara minst 3 tecken långt'
  }

  // Validera lösenord 
  if (!form.value.password.trim()) {
    errors.value.password = 'Lösenord är obligatoriskt'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Lösenordet måste vara minst 6 tecken långt'
  }

  // Returnera true om inga valideringsfel finns
  return !errors.value.username && !errors.value.password
}

// Hantera inloggningsförsök och omdirigering vid framgång
const handleLogin = async () => {
  // Rensa tidigare serverfelmeddelanden
  errorMessage.value = ''

  // Kör frontendvalidering innan API-anrop
  if (!validateForm()) {
    return
  }

  // Aktivera laddningsstatus
  loading.value = true

  try {
    // Försök autentisera användaren via auth store
    const result = await authStore.login(form.value.username, form.value.password)
    
    if (result.success) {
      // Omdirigera till användarens dashboard vid framgång
      authStore.redirectToDashboard(authStore.userRole)
    } else {
      // Visa serverfelmeddelande vid misslyckad autentisering
      errorMessage.value = result.message || 'Användarnamn eller lösenord är felaktigt'
      loading.value = false
    }
  } catch (error) {
    // Hantera oväntade fel som nätverksproblem
    errorMessage.value = 'Ett oväntat fel uppstod. Försök igen senare'
    loading.value = false
  }
}

// Rensa alla valideringsfel (används vid formulärreset)
const clearErrors = () => {
  errors.value = {
    username: null,
    password: null
  }
}

// Rensa endast fältvalideringsfel när användaren börjar skriva
const clearFieldErrors = () => {
  // Rensa endast valideringsfel för fälten
  errors.value = {
    username: null,
    password: null
  }
  // Behåll serverfelmeddelandet så användaren kan läsa det
}

// Kontrollera autentiseringsstatus vid komponentinitiering
onMounted(() => {
  // Omdirigera redan inloggade användare till deras dashboard
  if (authStore.isAuthenticated && authStore.user) {
    authStore.redirectToDashboard(authStore.userRole)
  }
})
</script>