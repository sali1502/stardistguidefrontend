/* router/index.js */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importera komponenter för olika vyer
import LoginView from '@/views/LoginView.vue'
import StatusView from '@/views/StatusView.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import DesignerDashboard from '@/views/DesignerDashboard.vue'
import DeveloperDashboard from '@/views/DeveloperDashboard.vue'
import TesterDashboard from '@/views/TesterDashboard.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

// Definiera alla applikationsrutter med metadata för behörighetskontroll
const routes = [
  // Startsida - automatisk omdirigering till inloggning
  {
    path: '/',
    redirect: '/login'
  },

  // Inloggningssida - endast för icke-inloggade användare
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresGuest: true,
      title: 'Logga in'
    }
  },

  // Statussida - tillgänglig för alla autentiserade användare
  {
    path: '/status',
    name: 'Status',
    component: StatusView,
    meta: {
      requiresAuth: true,
      title: 'Status'
    }
  },

  // Felhanteringssida för otillräckliga behörigheter
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: UnauthorizedView,
    meta: {
      title: 'Åtkomst nekad'
    }
  },

  // Rollspecifika dashboards med hierarkisk åtkomstkontroll
  // Administratörer har tillgång till alla dashboards
  {
    path: '/dashboard/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      allowedRoles: ['admin'],
      title: 'Admin Dashboard'
    }
  },
  {
    path: '/dashboard/designer',
    name: 'DesignerDashboard',
    component: DesignerDashboard,
    meta: {
      requiresAuth: true,
      allowedRoles: ['designer', 'admin'],
      title: 'Designer Dashboard'
    }
  },
  {
    path: '/dashboard/developer',
    name: 'DeveloperDashboard',
    component: DeveloperDashboard,
    meta: {
      requiresAuth: true,
      allowedRoles: ['developer', 'admin'],
      title: 'Utvecklare Dashboard'
    }
  },
  {
    path: '/dashboard/tester',
    name: 'TesterDashboard',
    component: TesterDashboard,
    meta: {
      requiresAuth: true,
      allowedRoles: ['tester', 'admin'],
      title: 'Testare Dashboard'
    }
  },

  // Catch-all rutt för 404-hantering - måste vara sist
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Sidan hittades inte'
    }
  }
]

// Skapa router-instans med webbhistorik och standardkonfiguration
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Hantera scroll-position vid sidnavigering
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guard för autentisering och behörighetskontroll
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Sätt dynamisk sidtitel baserat på rutt och användarroll
  if (to.meta.title) {
    let title = to.meta.title

    // Anpassa titel för dashboard-sidor med användarens rollnamn
    if (authStore.isAuthenticated && to.path.includes('dashboard')) {
      const roleDisplay = authStore.getRoleDisplayName(authStore.userRole)
      if (roleDisplay) {
        title = `${roleDisplay} Dashboard`
      }
    }

    document.title = `${title} - Guide för webbtillgänglighet`
  } else {
    document.title = 'Guide för webbtillgänglighet'
  }

  // Blockera icke-autentiserade användare från skyddade sidor
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Omdirigera redan inloggade användare från login-sidan
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const userRole = authStore.user?.role
    if (userRole) {
      next(`/dashboard/${userRole}`)
    } else {
      // Användare saknar giltig roll - rensa session
      authStore.logout()
      next('/login')
    }
    return
  }

  // Validera rollbehörigheter för begränsade sidor
  if (to.meta.allowedRoles && authStore.user) {
    const userRole = authStore.user.role
    const allowedRoles = to.meta.allowedRoles

    if (!allowedRoles.includes(userRole)) {
      next('/unauthorized')
      return
    }
  }

  // Fortsätt till målsidan om alla säkerhetskontroller är OK
  next()
})

export default router
