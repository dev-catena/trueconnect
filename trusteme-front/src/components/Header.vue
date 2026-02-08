
<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center space-x-3 logo logo-hover">
            <!-- Logo SVG do TrueConnect -->
            <img src="/logo.svg" alt="TrueConnect Logo" class="h-16 w-auto logo-image" />
            <div class="flex flex-col">
              <span class="text-xl font-bold text-trust-600">{{ siteName || 'TrueConnect' }}</span>
              <span v-if="siteSlogan" class="text-xs text-gray-500 leading-none">{{ siteSlogan }}</span>
            </div>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <router-link
              to="/"
              class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-trust-600 font-semibold': $route.name === 'Home' }"
            >
              Home
            </router-link>
            <router-link
              to="/planos"
              class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-trust-600 font-semibold': $route.name === 'Plans' }"
            >
              Planos
            </router-link>
            <router-link
              to="/sobre"
              class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-trust-600 font-semibold': $route.name === 'About' }"
            >
              Sobre
            </router-link>
            <router-link
              to="/faq"
              class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-trust-600 font-semibold': $route.name === 'Faq' }"
            >
              FAQ
            </router-link>
            <router-link
              to="/depoimentos"
              class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-trust-600 font-semibold': $route.name === 'Testimonials' }"
            >
              Depoimentos
            </router-link>
            <router-link
              to="/contato"
              class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-trust-600 font-semibold': $route.name === 'Contact' }"
            >
              Contato
            </router-link>
          </div>
        </div>

        <!-- User Menu -->
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6">
            <div v-if="authStore.isAuthenticated" class="relative">
              <div class="flex items-center space-x-4">
                <router-link
                  v-if="authStore.isAdmin"
                  to="/admin"
                  class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </router-link>
                <router-link
                  v-else-if="authStore.isServiceDesk"
                  to="/servicedesk"
                  class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Service Desk
                </router-link>
                <router-link
                  v-else
                  to="/dashboard"
                  class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </router-link>
                
                <!-- Profile Dropdown -->
                <div class="relative" ref="profileDropdown">
                  <button
                    @click="profileDropdownOpen = !profileDropdownOpen"
                    class="flex items-center space-x-2 text-gray-700 hover:text-trust-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-trust-500 rounded-full"
                  >
                    <div class="h-8 w-8 bg-trust-600 text-white rounded-full flex items-center justify-center">
                      {{ authStore.getUser?.name?.charAt(0).toUpperCase() }}
                    </div>
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  <div
                    v-show="profileDropdownOpen"
                    class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  >
                    <!-- User Info Header -->
                    <div class="px-4 py-3 border-b border-gray-200">
                      <p class="text-sm font-medium text-gray-900">{{ authStore.getUser?.name }}</p>
                      <p class="text-sm text-gray-600">{{ authStore.getUser?.email }}</p>
                    </div>

                    <!-- Menu Items -->
                    <div class="py-1">
                      <button
                        @click="openChangePasswordModal"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div class="flex items-center">
                          <svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2V7z" />
                          </svg>
                          Alterar Senha
                        </div>
                      </button>

                      <button
                        @click="openSubscriptionModal"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div class="flex items-center">
                          <svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Meu Plano
                        </div>
                      </button>

                      <button
                        @click="openPaymentHistoryModal"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div class="flex items-center">
                          <svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Histórico de Pagamentos
                        </div>
                      </button>

                      <div class="border-t border-gray-200 mt-1 pt-1">
                        <button
                          @click="handleLogout"
                          class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div class="flex items-center">
                            <svg class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex items-center space-x-4">
              <router-link
                to="/login"
                class="text-gray-700 hover:text-trust-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </router-link>
              <router-link
                to="/registro"
                class="btn-primary"
              >
                Registrar
              </router-link>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-700 hover:text-trust-600 p-2"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-show="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <router-link
            to="/"
            class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
            @click="mobileMenuOpen = false"
          >
            Home
          </router-link>
          <router-link
            to="/planos"
            class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
            @click="mobileMenuOpen = false"
          >
            Planos
          </router-link>
          <router-link
            to="/sobre"
            class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
            @click="mobileMenuOpen = false"
          >
            Sobre
          </router-link>
          <router-link
            to="/faq"
            class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
            @click="mobileMenuOpen = false"
          >
            FAQ
          </router-link>
          <router-link
            to="/depoimentos"
            class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
            @click="mobileMenuOpen = false"
          >
            Depoimentos
          </router-link>
          <router-link
            to="/contato"
            class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
            @click="mobileMenuOpen = false"
          >
            Contato
          </router-link>
          
          <div class="border-t border-gray-200 pt-4">
            <div v-if="authStore.isAuthenticated" class="space-y-1">
              <router-link
                v-if="authStore.isAdmin"
                to="/admin"
                class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
                @click="mobileMenuOpen = false"
              >
                Admin
              </router-link>
              <router-link
                v-else-if="authStore.isServiceDesk"
                to="/servicedesk"
                class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
                @click="mobileMenuOpen = false"
              >
                Service Desk
              </router-link>
              <router-link
                v-else
                to="/dashboard"
                class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
                @click="mobileMenuOpen = false"
              >
                Dashboard
              </router-link>
              <button
                @click="handleLogout"
                class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Sair
              </button>
            </div>
            <div v-else class="space-y-1">
              <router-link
                to="/login"
                class="text-gray-700 hover:text-trust-600 block px-3 py-2 rounded-md text-base font-medium"
                @click="mobileMenuOpen = false"
              >
                Login
              </router-link>
              <router-link
                to="/registro"
                class="btn-primary block text-center"
                @click="mobileMenuOpen = false"
              >
                Registrar
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <!-- Change Password Modal -->
  <div v-if="changePasswordModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="changePasswordModalOpen = false">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
        
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Senha Atual</label>
            <div class="relative">
              <input 
                v-model="changePasswordForm.current_password"
                :type="showCurrentPassword ? 'text' : 'password'" 
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-trust-500 focus:ring-trust-500 pr-10"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showCurrentPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.415m4.243 4.243l1.414 1.414M14.12 14.12l1.415 1.415" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Nova Senha</label>
            <div class="relative">
              <input 
                v-model="changePasswordForm.password"
                :type="showNewPassword ? 'text' : 'password'" 
                required
                minlength="8"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-trust-500 focus:ring-trust-500 pr-10"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showNewPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.415m4.243 4.243l1.414 1.414M14.12 14.12l1.415 1.415" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
            <div class="relative">
              <input 
                v-model="changePasswordForm.password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'" 
                required
                minlength="8"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-trust-500 focus:ring-trust-500 pr-10"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.415m4.243 4.243l1.414 1.414M14.12 14.12l1.415 1.415" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="changePasswordModalOpen = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-trust-600 rounded-md hover:bg-trust-700"
            >
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Subscription Modal -->
  <div v-if="subscriptionModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="subscriptionModalOpen = false">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Meu Plano</h3>
        
        <div v-if="userSubscriptions.length === 0" class="text-center py-8">
          <div class="mb-4">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Nenhum plano ativo</h4>
          <p class="text-gray-600 mb-4">Você ainda não possui uma assinatura ativa.</p>
          <router-link 
            to="/planos"
            @click="subscriptionModalOpen = false"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-trust-600 hover:bg-trust-700"
          >
            Ver Planos Disponíveis
          </router-link>
        </div>

        <div v-else>
          <div v-for="subscription in userSubscriptions" :key="subscription.id" 
               :class="['border rounded-lg p-4 mb-4', subscription.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50']">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-lg font-medium text-gray-900">{{ subscription.plan.name }}</h4>
                <p class="text-gray-600">{{ subscription.plan.description }}</p>
                <div class="mt-2 space-y-1">
                  <p class="text-sm">
                    <span class="font-medium">Contratado em:</span> 
                    {{ new Date(subscription.created_at).toLocaleDateString('pt-BR') }}
                  </p>
                  <p class="text-sm">
                    <span class="font-medium">Ciclo:</span> 
                    {{ subscription.billing_cycle === 'monthly' ? 'Mensal' : subscription.billing_cycle === 'semiannual' ? 'Semestral' : 'Anual' }}
                  </p>
                  <p class="text-sm">
                    <span class="font-medium">Valor:</span> 
                    R$ {{ subscription.amount }}
                  </p>
                  <p class="text-sm">
                    <span class="font-medium">Status:</span> 
                    <span :class="getStatusClass(subscription)">
                      {{ getStatusText(subscription) }}
                    </span>
                  </p>
                  <p class="text-sm" v-if="subscription.status === 'active'">
                    <span class="font-medium">Vence em:</span> 
                    {{ new Date(subscription.end_date).toLocaleDateString('pt-BR') }}
                  </p>
                  <p class="text-sm" v-else>
                    <span class="font-medium">Cancelado em:</span> 
                    {{ new Date(subscription.updated_at).toLocaleDateString('pt-BR') }}
                  </p>
                </div>
              </div>
              
              <div class="flex flex-col space-y-2">
                <router-link 
                  v-if="subscription.status === 'active'"
                  to="/planos"
                  @click="subscriptionModalOpen = false"
                  class="text-sm px-3 py-1 bg-trust-600 text-white rounded hover:bg-trust-700"
                >
                  Mudar Plano
                </router-link>
                <button 
                  v-if="subscription.status === 'active'"
                  @click="cancelSubscription(subscription.id)"
                  class="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end pt-4">
          <button 
            @click="subscriptionModalOpen = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment History Modal -->
  <div v-if="paymentHistoryModalOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="paymentHistoryModalOpen = false">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Histórico de Pagamentos</h3>
        
        <div v-if="paymentHistory.length === 0" class="text-center py-8">
          <div class="mb-4">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h4>
          <p class="text-gray-600">Você ainda não possui histórico de pagamentos.</p>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciclo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="payment in paymentHistory" :key="payment.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ new Date(payment.created_at).toLocaleDateString('pt-BR') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ payment.plan.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ payment.billing_cycle === 'monthly' ? 'Mensal' : payment.billing_cycle === 'semiannual' ? 'Semestral' : 'Anual' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {{ payment.amount }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="payment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ payment.status === 'active' ? 'Pago' : 'Cancelado' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ payment.payment_method || 'Mercado Pago' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="flex justify-end pt-4">
          <button 
            @click="paymentHistoryModalOpen = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)
const profileDropdownOpen = ref(false)
const profileDropdown = ref(null)

const siteName = ref('')
const siteSlogan = ref('')

// Modals refs
const changePasswordModalOpen = ref(false)
const subscriptionModalOpen = ref(false)
const paymentHistoryModalOpen = ref(false)

// Change password form
const changePasswordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// User data
const userProfile = ref(null)
const userSubscriptions = ref([])
const paymentHistory = ref([])

const handleLogout = async () => {
  await authStore.logout()
  mobileMenuOpen.value = false
  profileDropdownOpen.value = false
  router.push('/') // Redirecionar para home após logout
}

const openChangePasswordModal = () => {
  changePasswordModalOpen.value = true
  profileDropdownOpen.value = false
  // Reset form and visibility toggles
  changePasswordForm.value = {
    current_password: '',
    password: '',
    password_confirmation: ''
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

const openSubscriptionModal = async () => {
  await loadUserProfile()
  await loadUserSubscriptions()
  subscriptionModalOpen.value = true
  profileDropdownOpen.value = false
}

const openPaymentHistoryModal = async () => {
  await loadPaymentHistory()
  paymentHistoryModalOpen.value = true
  profileDropdownOpen.value = false
}

const loadUserProfile = async () => {
  try {
    const response = await api.get('/user/profile')
    if (response.data.success) {
      userProfile.value = response.data.data
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
  }
}

const loadUserSubscriptions = async () => {
  try {
    const response = await api.get('/user/subscriptions')
    if (response.data.success) {
      // Ordenação inteligente: ativos primeiro (por data desc), depois inativos (por data desc)
      userSubscriptions.value = response.data.data.sort((a, b) => {
        // Se um é ativo e outro não, o ativo vem primeiro
        if (a.status === 'active' && b.status !== 'active') return -1
        if (b.status === 'active' && a.status !== 'active') return 1
        
        // Se ambos têm o mesmo status, ordenar por data de criação (mais recente primeiro)
        return new Date(b.created_at) - new Date(a.created_at)
      })
    }
  } catch (error) {
    console.error('Erro ao carregar assinaturas:', error)
  }
}

const loadPaymentHistory = async () => {
  try {
    const response = await api.get('/user/subscriptions')
    if (response.data.success) {
      // Ordenar do mais recente para o mais antigo
      paymentHistory.value = response.data.data.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at)
      })
    }
  } catch (error) {
    console.error('Erro ao carregar histórico de pagamentos:', error)
  }
}

const changePassword = async () => {
  try {
    const response = await api.put('/user/profile', changePasswordForm.value)
    if (response.data.success) {
      alert('Senha alterada com sucesso!')
      changePasswordModalOpen.value = false
      changePasswordForm.value = {
        current_password: '',
        password: '',
        password_confirmation: ''
      }
      // Reset visibility toggles
      showCurrentPassword.value = false
      showNewPassword.value = false
      showConfirmPassword.value = false
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    alert('Erro ao alterar senha. Verifique se a senha atual está correta.')
  }
}

const cancelSubscription = async (subscriptionId) => {
  if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) {
    return
  }
  
  try {
    const response = await api.put(`/user/subscriptions/${subscriptionId}/cancel`)
    if (response.data.success) {
      alert('Assinatura cancelada com sucesso!')
      await loadUserSubscriptions()
    }
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    alert('Erro ao cancelar assinatura.')
  }
}

const changePlan = async (planId, billingCycle) => {
  try {
    // Redirecionar para a página de planos com o plano selecionado
    window.location.href = `/planos?plan=${planId}&cycle=${billingCycle}`
  } catch (error) {
    console.error('Erro ao mudar plano:', error)
  }
}

const getStatusClass = (subscription) => {
  if (subscription.status === 'active') {
    return 'text-green-600'
  } else if (subscription.status === 'expired') {
    return 'text-red-600'
  } else if (subscription.status === 'cancelled') {
    return 'text-gray-600'
  }
  return 'text-gray-600'
}

const getStatusText = (subscription) => {
  if (subscription.status === 'active') {
    return 'Ativo'
  } else if (subscription.status === 'expired') {
    return 'Expirado'
  } else if (subscription.status === 'cancelled') {
    return 'Cancelado'
  }
  return 'Desconhecido'
}

// Click outside to close dropdown
const handleClickOutside = (event) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target)) {
    profileDropdownOpen.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/site-content')
    if (data?.success) {
      siteName.value = data.data['site_name'] || 'TrueConnect'
      siteSlogan.value = data.data['site_slogan'] || ''
    }
  } catch (e) {
    console.error('Erro ao carregar conteúdo público:', e)
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
