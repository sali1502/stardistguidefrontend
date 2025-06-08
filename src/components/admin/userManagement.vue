<!-- components/admin/UserManagement.vue -->

<template>
    <div class="user-management">
        <!-- Sidhuvud med titel och skapaknapp -->
        <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
                <h3 class="mb-1">
                    <i class="bi bi-people me-2"></i>
                    Användarhantering
                </h3>
                <p class="text-muted mb-0">
                    Skapa, redigera och radera användare
                </p>
            </div>
            <button class="btn btn-primary btn-sm d-md-none" @click="openCreateModal" :disabled="usersStore.loading">
                <i class="bi bi-plus-lg me-2"></i>
                Ny användare
            </button>
            <button class="btn btn-primary d-none d-md-block" @click="openCreateModal" :disabled="usersStore.loading">
                <i class="bi bi-plus-lg me-2"></i>
                Skapa användare
            </button>
        </div>

        <!-- Felmeddelande från store -->
        <div v-if="usersStore.error" class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ usersStore.error }}
            <button type="button" class="btn-close float-end" @click="usersStore.clearError"></button>
        </div>

        <!-- Framgångsmeddelande -->
        <div v-if="successMessage" class="alert alert-success" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close float-end" @click="successMessage = ''"></button>
        </div>

        <!-- Användartabell med responsiv design -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-table me-2"></i>
                    Användarlista
                </h5>
            </div>
            <div class="card-body">
                <!-- Laddningsindikator -->
                <div v-if="usersStore.loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Laddar...</span>
                    </div>
                    <p class="mt-2 text-muted">Laddar användare...</p>
                </div>

                <!-- Användartabell för olika skärmstorlekar -->
                <div v-else-if="usersStore.users.length > 0">
                    <!-- Desktop tabell (stora skärmar) -->
                    <div class="table-responsive d-none d-lg-block">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Användarnamn</th>
                                    <th>Roll</th>
                                    <th>Skapad</th>
                                    <th width="120">Åtgärder</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in usersStore.users" :key="user.id || user._id">
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <i :class="getRoleIcon(user.role)" class="me-2"></i>
                                            <div>
                                                <div class="fw-bold">{{ user.username }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-darkblue">
                                            {{ user.roleDisplayName }}
                                        </span>
                                    </td>
                                    <td>
                                        <small>{{ formatDate(user.createdAt) }}</small>
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm" role="group">
                                            <button class="btn btn-outline-primary" @click="openEditModal(user)"
                                                :disabled="usersStore.loading" title="Redigera användare">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-delete" @click="confirmDelete(user)"
                                                :disabled="usersStore.loading" title="Ta bort användare">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Medium tabell (tablets) -->
                    <div class="table-responsive d-none d-md-block d-lg-none">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Användarnamn</th>
                                    <th>Roll</th>
                                    <th width="120">Åtgärder</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in usersStore.users" :key="user.id || user._id">
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <i :class="getRoleIcon(user.role)" class="me-2"></i>
                                            <div>
                                                <div class="fw-bold">{{ user.username }}</div>
                                                <div class="text-muted small">{{ formatDate(user.createdAt) }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-darkblue">
                                            {{ user.roleDisplayName }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm" role="group">
                                            <button class="btn btn-outline-primary" @click="openEditModal(user)"
                                                :disabled="usersStore.loading" title="Redigera användare">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-delete" @click="confirmDelete(user)"
                                                :disabled="usersStore.loading" title="Ta bort användare">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Layout för små tablets -->
                    <div class="d-none d-sm-block d-md-none">
                        <div v-for="user in usersStore.users" :key="user.id || user._id" class="user-row mb-2">
                            <div class="d-flex justify-content-between align-items-center p-3">
                                <div class="d-flex align-items-center flex-grow-1">
                                    <i :class="getRoleIcon(user.role)" class="me-3"></i>
                                    <div class="me-3">
                                        <div class="fw-bold">{{ user.username }}</div>
                                        <span class="badge bg-darkblue">
                                            {{ user.roleDisplayName }}
                                        </span>
                                    </div>
                                </div>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button class="btn btn-outline-primary" @click="openEditModal(user)"
                                        :disabled="usersStore.loading" title="Redigera användare">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-delete" @click="confirmDelete(user)"
                                        :disabled="usersStore.loading" title="Ta bort användare">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobil kortlayout för små skärmar -->
                    <div class="d-sm-none">
                        <div v-for="user in usersStore.users" :key="user.id || user._id" class="user-card mb-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="d-flex align-items-center flex-grow-1">
                                    <i :class="getRoleIcon(user.role)" class="me-3"></i>
                                    <div>
                                        <div class="fw-bold mb-1">{{ user.username }}</div>
                                        <span class="badge bg-darkblue">
                                            {{ user.roleDisplayName }}
                                        </span>
                                        <div class="text-muted small mt-1">
                                            Skapad: {{ formatDate(user.createdAt) }}
                                        </div>
                                    </div>
                                </div>
                                <div class="btn-group btn-group-sm ms-2" role="group">
                                    <button class="btn btn-outline-primary" @click="openEditModal(user)"
                                        :disabled="usersStore.loading" title="Redigera användare">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-delete" @click="confirmDelete(user)"
                                        :disabled="usersStore.loading" title="Ta bort användare">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tom lista - inga användare -->
                <div v-else class="text-center py-4">
                    <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3 text-muted">Inga användare hittades</h5>
                    <p class="text-muted">Skapa din första användare genom att klicka på "Skapa användare"</p>
                </div>
            </div>
        </div>

        <!-- Modal för att skapa/redigera användare -->
        <UserFormModal v-if="showModal" :user="editingUser" :is-editing="isEditing" @save="handleSave"
            @close="closeModal" />

        <!-- Modal för att bekräfta borttagning -->
        <UserDeleteModal v-if="showDeleteModal" :user="userToDelete" @confirm="handleDelete" @cancel="cancelDelete" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import UserFormModal from './UserFormModal.vue'
import UserDeleteModal from './UserDeleteModal.vue'

const usersStore = useUsersStore()

// Reaktiv data för modalhantering
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const userToDelete = ref(null)
const successMessage = ref('')

// Skapa ny användare eller redigera kontrolleras av isEditing
const isEditing = computed(() => !!editingUser.value)

// Funktioner för att öppna och stänga modaler
const openCreateModal = () => {
    editingUser.value = null
    showModal.value = true
}

const openEditModal = (user) => {
    editingUser.value = { ...user }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingUser.value = null
}

const confirmDelete = (user) => {
    userToDelete.value = user
    showDeleteModal.value = true
}

const cancelDelete = () => {
    showDeleteModal.value = false
    userToDelete.value = null
}

// Hantera spara användare (skapa eller uppdatera)
const handleSave = async (userData, callback) => {
    try {
        let result

        // Skapa eller uppdatera avgörs baserat på isEditing
        if (isEditing.value) {
            result = await usersStore.updateUser(editingUser.value.id || editingUser.value._id, userData)
        } else {
            result = await usersStore.createUser(userData)
        }

        // Hantera framgångsrikt resultat
        if (result && result.success === true) {
            successMessage.value = result.message || 'Operationen lyckades'
            closeModal()

            // Rensa framgångsmeddelandet efter fem sekunder
            setTimeout(() => {
                successMessage.value = ''
            }, 5000)
        }

        // Anropa callback med resultatet för felhantering i modal
        const finalResult = result || { success: false, message: 'Inget svar från server' }

        if (callback) {
            callback(finalResult)
        }

    } catch (error) {
        // Hantera fel och skicka strukturerat felmeddelande till callback
        const errorResult = {
            success: false,
            message: 'Ett oväntat fel uppstod',
            error: error
        }

        if (callback) {
            callback(errorResult)
        }
    }
}

// Hantera borttagning av användare
const handleDelete = async () => {
    if (!userToDelete.value) return

    try {
        const result = await usersStore.deleteUser(userToDelete.value.id || userToDelete.value._id)

        // Visa framgångsmeddelande om borttagningen lyckades
        if (result && result.success) {
            successMessage.value = result.message

            // Rensa meddelandet efter fem sekunder
            setTimeout(() => {
                successMessage.value = ''
            }, 5000)
        }

        cancelDelete()
    } catch (error) {
        // Stäng modal även vid fel - felmeddelandet hanteras av store
        cancelDelete()
    }
}

const getRoleIcon = (role) => {
    const icons = {
        'admin': 'bi bi-gear-fill text-darkblue',
        'designer': 'bi bi-palette-fill text-darkblue',
        'developer': 'bi bi-code-slash text-darkblue',
        'tester': 'bi bi-bug-fill text-darkblue'
    }
    return icons[role] || 'bi bi-person text-darkblue'
}

// Hämta badgeklass för given roll
const getRoleBadgeClass = (role) => {
    const classes = {
        'admin': 'bg-darkblue',
        'designer': 'bg-darkblue',
        'developer': 'bg-darkblue',
        'tester': 'bg-darkblue'
    }
    return classes[role] || 'bg-darkblue'
}

// Formatera datum för visning i användargränssnittet
const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// Hämta användare när komponenten laddas
onMounted(() => {
    usersStore.fetchUsers()
})
</script>

<style scoped>
.user-management {
    padding: 0;
}

.card {
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
}

.badge {
    font-size: 0.75em;
}

.btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
}

.alert {
    border: none;
    border-radius: 8px;
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.btn-group .btn {
    margin-right: 2px;
}

.btn-group .btn:last-child {
    margin-right: 0;
}

.bg-darkblue {
    background-color: #0f172a !important;
    color: white !important;
}

.text-darkblue {
    color: #0f172a !important;
}

.bg-blue-darkest {
    background-color: #0f172a !important;
    color: white;
}

.bg-blue-dark {
    background-color: #1e293b !important;
    color: white;
}

.bg-blue-medium-dark {
    background-color: #334155 !important;
    color: white;
}

.bg-blue-medium {
    background-color: #475569 !important;
    color: white;
}

.text-blue-darkest {
    color: #0f172a !important;
}

.text-blue-dark {
    color: #1e293b !important;
}

.text-blue-medium-dark {
    color: #334155 !important;
}

.text-blue-medium {
    color: #475569 !important;
}

/* Layoutstillar för responsiva breakpoints */
.user-row {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-row:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Mobilkort för användare */
.user-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-card:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Responsiva justeringar för olika skärmstorlekar */
@media (max-width: 991px) {

    .user-card i,
    .user-row i {
        font-size: 1.1rem;
    }
}

@media (max-width: 767px) {
    .user-row {
        padding: 0.5rem;
    }
}

@media (max-width: 575px) {
    .user-card i {
        font-size: 1.25rem;
    }

    .btn-group-sm .btn {
        padding: 0.375rem 0.5rem;
    }
}

.btn-delete {
    background-color: #0f172a !important;
    border-color: #0f172a !important;
    color: white !important;
}

.btn-delete:hover {
    background-color: #1e293b !important;
    border-color: #1e293b !important;
    color: white !important;
}

.btn-delete:focus {
    background-color: #0f172a !important;
    border-color: #0f172a !important;
    color: white !important;
    box-shadow: 0 0 0 0.2rem rgba(15, 23, 42, 0.5) !important;
}

.btn-delete:active {
    background-color: #0c1426 !important;
    border-color: #0c1426 !important;
    color: white !important;
}

.btn-delete i {
    color: white !important;
}
</style>