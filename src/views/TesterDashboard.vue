<!-- views/TesterDashboard.vue - Dashboard för testarrollen -->

<template>
  <BaseDashboard>
    <!-- Rollspecifika flikar för testare med anpassat innehåll -->
    <RoleDashboardTabs user-role="tester" />
  </BaseDashboard>
</template>

<script setup>
import BaseDashboard from '@/components/BaseDashboard.vue'
import RoleDashboardTabs from '@/components/RoleDashboardTabs.vue'
</script>