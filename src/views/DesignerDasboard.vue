<!-- views/DesignerDashboard.vue - Dashboard för designerrollen -->
 
<template>
  <BaseDashboard>
    <!-- Rollspecifika flikar för designer med anpassat innehåll -->
    <RoleDashboardTabs user-role="designer" />
  </BaseDashboard>
</template>

<script setup>
import BaseDashboard from '@/components/BaseDashboard.vue'
import RoleDashboardTabs from '@/components/RoleDashboardTabs.vue'
</script>