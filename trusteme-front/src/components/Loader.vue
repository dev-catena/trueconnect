
<template>
  <div class="loader-container">
    <!-- Spinner Circular -->
    <div v-if="type === 'spinner'" class="spinner-container">
      <div class="spinner w-8 h-8 border-4 border-trust-200 border-t-trust-600 rounded-full"></div>
      <p v-if="text" class="mt-4 text-gray-600">{{ text }}</p>
    </div>

    <!-- Spinner Dots -->
    <div v-else-if="type === 'dots'" class="dots-container">
      <div class="flex space-x-2">
        <div class="w-3 h-3 bg-trust-600 rounded-full animate-pulse animation-delay-100"></div>
        <div class="w-3 h-3 bg-trust-600 rounded-full animate-pulse animation-delay-200"></div>
        <div class="w-3 h-3 bg-trust-600 rounded-full animate-pulse animation-delay-300"></div>
      </div>
      <p v-if="text" class="mt-4 text-gray-600">{{ text }}</p>
    </div>

    <!-- Progress Bar -->
    <div v-else-if="type === 'progress'" class="progress-container">
      <div class="progress-bar w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="progress-fill h-full rounded-full"
          :style="{ '--progress-width': progress + '%' }"
        ></div>
      </div>
      <p v-if="text" class="mt-2 text-gray-600">{{ text }}</p>
    </div>

    <!-- Shimmer Loading -->
    <div v-else-if="type === 'shimmer'" class="shimmer-container">
      <div class="shimmer w-64 h-4 bg-gray-200 rounded"></div>
      <div class="shimmer w-48 h-4 bg-gray-200 rounded mt-2"></div>
      <div class="shimmer w-56 h-4 bg-gray-200 rounded mt-2"></div>
    </div>

    <!-- Default Spinner -->
    <div v-else class="default-spinner">
      <div class="spinner w-6 h-6 border-2 border-trust-200 border-t-trust-600 rounded-full"></div>
      <p v-if="text" class="mt-2 text-sm text-gray-600">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'dots', 'progress', 'shimmer'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  }
})
</script>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.spinner-container,
.dots-container,
.progress-container,
.shimmer-container,
.default-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Custom spinner sizes */
.spinner-slow {
  animation: spin 2s linear infinite;
}

.spinner-fast {
  animation: spin 0.5s linear infinite;
}

/* Progress bar custom styles */
.progress-container {
  width: 100%;
  max-width: 300px;
}

/* Shimmer effect */
.shimmer-container .shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
</style>
