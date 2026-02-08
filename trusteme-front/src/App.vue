
<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Header />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Fetch user data if token exists
  if (authStore.token && !authStore.user) {
    authStore.fetchUser()
  }
})
</script>
