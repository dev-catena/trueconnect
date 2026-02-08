<template>
  <div 
    class="absolute bg-white rounded-lg shadow-lg p-4 border border-blue-100 animate-fade-in-up animation-delay-500 hover-lift"
    :class="badgeClasses"
  >
    <div class="flex items-center space-x-3">
      <!-- Estrela animada -->
      <div class="star-container animate-bounce-in animation-delay-700">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          class="lucide lucide-star h-8 w-8 text-yellow-500 star-glow"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </div>
      
      <!-- Texto da avaliação -->
      <div class="rating-text animate-fade-in-left animation-delay-800">
        <p class="font-semibold text-gray-900 animate-scale-in animation-delay-1000">{{ rating }}</p>
        <p class="text-sm text-gray-600">{{ label }}</p>
      </div>
    </div>
    
    <!-- Efeito de brilho adicional -->
    <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rating: {
    type: String,
    default: '5.0'
  },
  label: {
    type: String,
    default: 'Avaliação'
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

// Classes dinâmicas baseadas nas props
const badgeClasses = computed(() => {
  const positionClasses = {
    'top-right': '-top-6 -right-6',
    'top-left': '-top-6 -left-6',
    'bottom-right': '-bottom-6 -right-6',
    'bottom-left': '-bottom-6 -left-6'
  }
  
  const sizeClasses = {
    'sm': 'p-3',
    'md': 'p-4',
    'lg': 'p-5'
  }
  
  return `${positionClasses[props.position]} ${sizeClasses[props.size]}`
})
</script>

<style scoped>
/* Animações específicas para o badge */
.star-container {
  position: relative;
}

.star-glow {
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
  transition: all 0.3s ease;
}

.star-glow:hover {
  filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.8));
  transform: scale(1.1);
}

/* Animação de pulso para a estrela */
@keyframes starPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
  }
  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.8));
  }
}

.star-container:hover .star-glow {
  animation: starPulse 1s ease-in-out infinite;
}

/* Animação de entrada para o texto */
.rating-text {
  opacity: 0;
  transform: translateX(-10px);
  animation: fadeInLeft 0.8s ease-out 0.8s forwards;
}

/* Efeito de hover no badge */
.hover-lift:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

/* Responsividade */
@media (max-width: 768px) {
  .absolute {
    position: relative;
    top: 0;
    right: 0;
    margin: 1rem;
  }
  
  .star-glow {
    filter: none;
  }
  
  .star-glow:hover {
    filter: none;
    transform: none;
  }
}

/* Acessibilidade - reduzir movimento */
@media (prefers-reduced-motion: reduce) {
  .star-glow {
    animation: none;
    filter: none;
  }
  
  .hover-lift:hover {
    transform: none;
  }
  
  .animate-bounce-in,
  .animate-fade-in-up,
  .animate-fade-in-left,
  .animate-scale-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style> 