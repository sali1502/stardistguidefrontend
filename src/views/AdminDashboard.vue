
<!-- views/AdminDashboard.vue - Huvuddashboard för admin -->
 
<template>
  <BaseDashboard>
    <!-- Navigationsmenyn med flikar för olika hanteringsområden -->
    <div class="admin-navigation mb-4">
      <ul class="nav nav-tabs nav-fill">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
            <i class="bi bi-speedometer2 me-2"></i>
            Översikt
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
            <i class="bi bi-people me-2"></i>
            Användare
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'projects' }" @click="activeTab = 'projects'">
            <i class="bi bi-folder me-2"></i>
            Projekt
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">
            <i class="bi bi-file-text me-2"></i>
            Inlägg
          </button>
        </li>
      </ul>
    </div>

    <!-- Innehåll för vald flik -->
    <div class="tab-content">
      <!-- Översiktsflik med statistik och navigation -->
      <div v-if="activeTab === 'overview'" class="tab-pane active">
        <AdminOverview @navigate="activeTab = $event" />
      </div>

      <!-- Användarhanteringsflik med CRUD för användare -->
      <div v-if="activeTab === 'users'" class="tab-pane active">
        <UserManagement />
      </div>

      <!-- Projekthanteringsflik med CRUD för projekt -->
      <div v-if="activeTab === 'projects'" class="tab-pane active">
        <ProjectManagement />
      </div>

      <!-- Inläggshanteringsflik med CRUD för inlägg -->
      <div v-if="activeTab === 'posts'" class="tab-pane active">
        <PostManagement />
      </div>
    </div>
  </BaseDashboard>
</template>

<script setup>
import { ref } from 'vue'
import BaseDashboard from '@/components/BaseDashboard.vue'
import UserManagement from '@/components/admin/userManagement.vue'
import ProjectManagement from '@/components/admin/ProjectManagement.vue'
import PostManagement from '@/components/admin/PostManagement.vue'
import AdminOverview from '@/components/admin/AdminOverview.vue'

// Reaktivt tillstånd för att hålla koll på vilken flik som är aktiv
const activeTab = ref('overview')
</script>

<style scoped>
/* Styling för navigationsflikar */
.admin-navigation .nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.admin-navigation .nav-link {
  background: none;
  border: none;
  color: #495057;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

/* Hovereffekt för navigationslänkar */
.admin-navigation .nav-link:hover {
  color: #343a40;
  background-color: #f8f9fa;
  border-radius: 8px;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Styling för aktiv navigationslänk */
.admin-navigation .nav-link.active {
  color: #1e293b;
  background-color: white;
  border-bottom: 2px solid #1e293b;
  font-weight: 600;
}

/* Innehållsområde för flikarna */
.tab-content {
  margin-top: 0;
}

/* Animation för flikbyten */
.tab-pane {
  animation: fadeIn 0.3s ease-in;
}

/* Fadein animation för mjuka övergångar */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>