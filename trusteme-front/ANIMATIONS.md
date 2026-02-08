# Sistema de Animações CSS Nativas - Trust Me

Este documento descreve o sistema completo de animações CSS nativas implementado no projeto Trust Me.

## 📋 Índice

1. [Animações de Keyframes](#animações-de-keyframes)
2. [Transições CSS Customizadas](#transições-css-customizadas)
3. [Sistema Responsivo](#sistema-responsivo)
4. [Componentes Animados](#componentes-animados)
5. [RatingBadge Component](#ratingbadge-component)
6. [Como Usar](#como-usar)
7. [Exemplos](#exemplos)

## 🎬 Animações de Keyframes

### Animações de Entrada

```css
/* Fade In */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Fade In Up */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

/* Fade In Left */
.animate-fade-in-left {
  animation: fadeInLeft 0.8s ease-out;
}

/* Fade In Right */
.animate-fade-in-right {
  animation: fadeInRight 0.8s ease-out;
}
```

### Animações Especiais

```css
/* Bounce In */
.animate-bounce-in {
  animation: bounceIn 0.8s ease-out;
}

/* Scale In */
.animate-scale-in {
  animation: scaleIn 0.5s ease-out;
}

/* Slide In */
.animate-slide-in-up {
  animation: slideInUp 0.6s ease-out;
}
```

### Spinners e Loaders

```css
/* Spinner Circular */
.spinner {
  animation: spin 1s linear infinite;
}

/* Spinner Lento */
.spinner-slow {
  animation: spin 2s linear infinite;
}

/* Spinner Rápido */
.spinner-fast {
  animation: spin 0.5s linear infinite;
}

/* Pulse */
.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### Progress Bar

```css
.progress-fill {
  animation: progressFill 1s ease-out;
}
```

## 🔄 Transições CSS Customizadas

### Transições Básicas

```css
/* Transição Geral */
.transition-all {
  transition: all 0.3s ease;
}

/* Transição de Cores */
.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

/* Transição de Transform */
.transition-transform {
  transition: transform 0.3s ease;
}

/* Transição de Opacidade */
.transition-opacity {
  transition: opacity 0.3s ease;
}
```

### Transições Específicas

```css
/* Transição de Borda */
.transition-border {
  transition: border-color 0.3s ease;
}

/* Transição de Background */
.transition-bg {
  transition: background-color 0.3s ease;
}

/* Transição de Sombra */
.transition-shadow {
  transition: box-shadow 0.3s ease;
}
```

### Efeitos Hover

```css
/* Hover Lift */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Hover Scale */
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* Hover Glow */
.hover-glow {
  transition: box-shadow 0.3s ease;
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
}
```

## 📱 Sistema Responsivo

### Breakpoints de Animação

```css
/* Desktop - Animações completas */
@media (min-width: 769px) {
  .animate-fade-in-left,
  .animate-fade-in-right {
    /* Animações completas */
  }
}

/* Tablet - Animações otimizadas */
@media (max-width: 768px) {
  .animate-fade-in-left,
  .animate-fade-in-right {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .hero-float {
    animation: none;
  }
}

/* Mobile - Animações simplificadas */
@media (max-width: 480px) {
  .animate-bounce-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  .hover-lift:hover {
    transform: none;
  }
}
```

## 🧩 Componentes Animados

### Botões

```html
<!-- Botão Hero -->
<button class="btn-hero bg-trust-600 text-white px-6 py-3 rounded-lg">
  Botão Hero
</button>

<!-- Botão Animado -->
<button class="btn-animated bg-gray-600 text-white px-6 py-3 rounded-lg">
  Botão Animado
</button>
```

### Cards

```html
<!-- Card com Animação -->
<div class="card-animated p-6 bg-white rounded-lg shadow-md">
  <h3>Card Animado</h3>
  <p>Conteúdo do card</p>
</div>
```

### Loaders

```html
<!-- Spinner Circular -->
<Loader type="spinner" text="Carregando..." />

<!-- Spinner Dots -->
<Loader type="dots" text="Processando..." />

<!-- Progress Bar -->
<Loader type="progress" :progress="75" text="75% Concluído" />

<!-- Shimmer -->
<Loader type="shimmer" />
```

## ⭐ RatingBadge Component

O componente `RatingBadge` é um badge de avaliação com estrelas que inclui animações CSS nativas.

### Props Disponíveis

```javascript
{
  rating: String,      // Ex: "5.0", "4.8"
  label: String,       // Ex: "Avaliação", "Rating"
  position: String,    // "top-right", "top-left", "bottom-right", "bottom-left"
  size: String         // "sm", "md", "lg"
}
```

### Uso Básico

```html
<!-- Badge padrão -->
<RatingBadge rating="5.0" label="Avaliação" />

<!-- Badge com posição personalizada -->
<RatingBadge 
  rating="4.8" 
  label="Rating" 
  position="top-left" 
  size="lg" 
/>
```

### Animações Incluídas

1. **Entrada Animada:**
   - Badge aparece com `fade-in-up`
   - Estrela aparece com `bounce-in`
   - Texto aparece com `fade-in-left`

2. **Efeitos Hover:**
   - Badge levanta e escala no hover
   - Estrela brilha e pulsa no hover
   - Efeito de brilho no fundo

3. **Estrela Animada:**
   - Glow effect permanente
   - Pulse animation no hover
   - Scale effect no hover

### Exemplo Completo

```html
<template>
  <div class="relative">
    <!-- Conteúdo do card -->
    <div class="card-animated p-6 bg-white rounded-lg shadow-md">
      <h3>Produto Premium</h3>
      <p>Descrição do produto</p>
    </div>
    
    <!-- Badge de avaliação -->
    <RatingBadge 
      rating="5.0" 
      label="Avaliação" 
      position="top-right"
      size="sm"
    />
  </div>
</template>

<script setup>
import RatingBadge from './components/RatingBadge.vue'
</script>
```

### Animações Específicas do RatingBadge

```css
/* Glow da estrela */
.star-glow {
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
  transition: all 0.3s ease;
}

/* Pulse da estrela no hover */
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

/* Hover do badge */
.hover-lift:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}
```

### Responsividade

```css
/* Mobile - Remove efeitos visuais */
@media (max-width: 768px) {
  .star-glow {
    filter: none;
  }
  
  .hover-lift:hover {
    transform: none;
  }
}

/* Acessibilidade */
@media (prefers-reduced-motion: reduce) {
  .star-glow {
    animation: none;
    filter: none;
  }
}
```

## 🚀 Como Usar

### 1. Animações de Entrada

```html
<!-- Elemento que aparece com fade in -->
<div class="animate-fade-in">
  Conteúdo que aparece suavemente
</div>

<!-- Elemento que aparece de baixo -->
<div class="animate-fade-in-up">
  Conteúdo que sobe
</div>

<!-- Elemento que aparece da esquerda -->
<div class="animate-fade-in-left">
  Conteúdo que vem da esquerda
</div>
```

### 2. Delays de Animação

```html
<!-- Delay de 200ms -->
<div class="animate-fade-in-up animation-delay-200">
  Aparece após 200ms
</div>

<!-- Delay de 500ms -->
<div class="animate-fade-in-up animation-delay-500">
  Aparece após 500ms
</div>
```

### 3. Transições em Botões

```html
<!-- Botão com transição de cor -->
<button class="transition-colors bg-blue-500 hover:bg-blue-600">
  Hover para mudar cor
</button>

<!-- Botão com transição de escala -->
<button class="transition-transform hover:scale-105">
  Hover para escalar
</button>
```

### 4. Cards com Hover

```html
<!-- Card que levanta no hover -->
<div class="hover-lift p-6 bg-white rounded-lg shadow-md">
  <h3>Card que levanta</h3>
  <p>Passe o mouse para ver o efeito</p>
</div>

<!-- Card que escala no hover -->
<div class="hover-scale p-6 bg-white rounded-lg shadow-md">
  <h3>Card que escala</h3>
  <p>Passe o mouse para ver o efeito</p>
</div>
```

### 5. RatingBadge

```html
<!-- Badge simples -->
<RatingBadge rating="5.0" label="Avaliação" />

<!-- Badge personalizado -->
<RatingBadge 
  rating="4.8" 
  label="Rating" 
  position="top-left"
  size="lg"
/>
```

## 📝 Exemplos

### Hero Section Animado

```html
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <!-- Texto que aparece da esquerda -->
      <div class="hero-text animate-fade-in-left animation-delay-200">
        <h1 class="animate-fade-in-up animation-delay-300">
          Título Principal
        </h1>
        <p class="animate-fade-in-up animation-delay-400">
          Descrição do produto
        </p>
        <div class="animate-fade-in-up animation-delay-600">
          <button class="btn-hero">
            Call to Action
          </button>
        </div>
      </div>
      
      <!-- Imagem que aparece da direita -->
      <div class="hero-image animate-fade-in-right animation-delay-400">
        <img src="..." alt="..." class="hero-float hero-glow" />
        <!-- Badge de avaliação -->
        <RatingBadge rating="5.0" label="Avaliação" position="top-right" />
      </div>
    </div>
  </div>
</section>
```

### Lista de Itens Animada

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="card-animated animate-fade-in-up animation-delay-200 relative">
    <h3>Item 1</h3>
    <p>Descrição do item</p>
    <RatingBadge rating="4.9" label="Avaliação" position="top-right" size="sm" />
  </div>
  
  <div class="card-animated animate-fade-in-up animation-delay-400 relative">
    <h3>Item 2</h3>
    <p>Descrição do item</p>
    <RatingBadge rating="5.0" label="Perfeito" position="top-right" size="sm" />
  </div>
  
  <div class="card-animated animate-fade-in-up animation-delay-600 relative">
    <h3>Item 3</h3>
    <p>Descrição do item</p>
    <RatingBadge rating="4.7" label="Muito Bom" position="top-right" size="sm" />
  </div>
</div>
```

### Loading States

```html
<!-- Loading com spinner -->
<div v-if="loading" class="flex justify-center">
  <Loader type="spinner" text="Carregando dados..." />
</div>

<!-- Loading com progress bar -->
<div v-if="uploading" class="w-full">
  <Loader type="progress" :progress="uploadProgress" text="Enviando arquivo..." />
</div>

<!-- Loading com shimmer -->
<div v-if="loadingContent" class="w-full">
  <Loader type="shimmer" />
</div>
```

## 🎨 Classes Utilitárias

### Delays de Animação
- `.animation-delay-100` - 100ms
- `.animation-delay-200` - 200ms
- `.animation-delay-300` - 300ms
- `.animation-delay-500` - 500ms
- `.animation-delay-700` - 700ms
- `.animation-delay-1000` - 1000ms

### Durações de Animação
- `.animation-duration-fast` - 0.3s
- `.animation-duration-normal` - 0.6s
- `.animation-duration-slow` - 1s

### Estados de Loading
- `.loading` - Aplica pulse
- `.loading-spinner` - Aplica spinner

## 🔧 Customização

### Criando Novas Animações

```css
/* Nova animação personalizada */
@keyframes minhaAnimacao {
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.minha-animacao {
  animation: minhaAnimacao 0.8s ease-out;
}
```

### Modificando Transições Existentes

```css
/* Transição mais lenta */
.transition-slow {
  transition: all 0.6s ease;
}

/* Transição mais rápida */
.transition-fast {
  transition: all 0.15s ease;
}
```

## 📊 Performance

### Boas Práticas

1. **Use `transform` e `opacity`** para animações suaves
2. **Evite animar `width` e `height`** - use `transform: scale()`
3. **Use `will-change`** para elementos que serão animados
4. **Desabilite animações em dispositivos que preferem menos movimento**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Otimizações

```css
/* Otimização para GPU */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

## 🎯 Conclusão

Este sistema de animações CSS nativas fornece:

- ✅ **Performance otimizada** com animações baseadas em GPU
- ✅ **Responsividade** com breakpoints específicos
- ✅ **Acessibilidade** com suporte a `prefers-reduced-motion`
- ✅ **Flexibilidade** com classes utilitárias
- ✅ **Consistência** com design system
- ✅ **Fácil manutenção** com CSS modular
- ✅ **Componente RatingBadge** com animações especiais

Use estas animações para criar experiências de usuário mais envolventes e profissionais no seu projeto Trust Me! 