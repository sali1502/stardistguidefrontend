<!-- components/RoleDashboardTabs.vue - tabbkomponent som kombinerar projektväljare, checklista och rollspecifika inlägg -->

<template>
  <div class="role-dashboard-tabs">
    <!-- Projektväljare för att välja aktivt projekt -->
    <ProjectSelector v-model="selectedProjectId" @project-selected="handleProjectSelected" />

    <!-- Tabbnavigering för checklista och inlägg -->
    <div class="dashboard-tabs">
      <ul class="nav nav-tabs" id="roleTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ active: activeTab === 'checklist' }" @click="activeTab = 'checklist'"
            type="button">
            <i class="bi bi-check2-square me-2"></i>
            Checklista
            <span v-if="checklistProgress" class="badge bg-secondary ms-2">
              {{ checklistProgress.completed }}/{{ checklistProgress.total }}
            </span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'"
            type="button">
            <i class="bi bi-file-text me-2"></i>
            Inlägg för {{ getRoleDisplayName(userRole) }}
            <span v-if="filteredPosts.length > 0" class="badge bg-primary ms-2">
              {{ filteredPosts.length }}
            </span>
          </button>
        </li>
      </ul>

      <!-- Tabbinnehåll -->
      <div class="tab-content mt-3">
        <!-- Checklista flik -->
        <div v-show="activeTab === 'checklist'" class="tab-pane fade"
          :class="{ 'show active': activeTab === 'checklist' }">
          <RoleChecklist :project-id="selectedProjectId" :project-name="selectedProjectName" :user-role="userRole"
            @progress-updated="handleProgressUpdate" />
        </div>

        <!-- Inlägg flik -->
        <div v-show="activeTab === 'posts'" class="tab-pane fade" :class="{ 'show active': activeTab === 'posts' }">
          <RolePosts :user-role="userRole" :project-id="selectedProjectId" :project-name="selectedProjectName" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProjectSelector from './ProjectSelector.vue'
import RoleChecklist from './RoleChecklist.vue'
import RolePosts from './RolePosts.vue'

// Props från föräldrakomponent
const props = defineProps({
  userRole: {
    type: String,
    required: true
  }
})

// Reaktiv data för projekthantering och tabbnavigering
const selectedProjectId = ref(null)
const selectedProjectName = ref('')
const activeTab = ref('checklist')
const checklistProgress = ref(null)

// Uppdateras från RolePostskomponenten
const filteredPosts = ref([])

// Hantera när användaren väljer ett projekt
const handleProjectSelected = (project) => {
  if (project) {
    selectedProjectName.value = project.name
  } else {
    selectedProjectName.value = ''
  }
}

// Hantera uppdateringar av checklistprogress från RoleChecklist
const handleProgressUpdate = (progressData) => {
  checklistProgress.value = {
    completed: progressData.completedItems,
    total: progressData.totalItems
  }
}

// Översätt rollnamn till svenska för visning i användargränssnittet
const getRoleDisplayName = (role) => {
  const names = {
    'designer': 'Designer',
    'developer': 'Utvecklare',
    'tester': 'Testare'
  }
  return names[role] || role
}
</script>

<style scoped>
.role-dashboard-tabs {
  padding: 0;
}

.dashboard-tabs {
  margin-top: 1.5rem;
}

.nav-tabs {
  border-bottom: 2px solid #e2e8f0;
}

.nav-link {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 500;
  padding: 1rem 1.5rem;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;
}

.nav-link:hover {
  color: #334155;
  background-color: #f8fafc;
}

.nav-link.active {
  color: #1e293b;
  background-color: white;
  border-bottom: 2px solid #334155;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}

.badge.bg-secondary {
  background-color: #64748b !important;
}

.badge.bg-primary {
  background-color: #334155 !important;
}

.tab-content {
  background: white;
  border-radius: 0 8px 8px 8px;
  min-height: 400px;
}

.tab-pane {
  padding: 1.5rem;
}

/* Responsiv design för mobila enheter */
@media (max-width: 768px) {
  .nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .badge {
    font-size: 0.7rem;
  }
}
</style>