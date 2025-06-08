<!-- views/DeveloperDashboard.vue - Dashboard för utvecklarrollen -->

<template>
  <BaseDashboard>
    <!-- Rollspecifika flikar för utvecklare med anpassat innehåll -->
    <RoleDashboardTabs user-role="developer" />
  </BaseDashboard>
</template>

<script setup>
import BaseDashboard from '@/components/BaseDashboard.vue'
import RoleDashboardTabs from '@/components/RoleDashboardTabs.vue'
</script>