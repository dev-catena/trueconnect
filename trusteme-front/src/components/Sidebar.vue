  <router-link
    to="/admin/users"
    class="nav-link"
    :class="{ 'active': $route.name === 'admin-users' }"
  >
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>
    Usuários
  </router-link>

  <router-link
    to="/admin/contract-types"
    class="nav-link"
    :class="{ 'active': $route.name === 'admin-contract-types' }"
  >
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    Tipos de Contrato
  </router-link>

  <router-link
    to="/admin/site-settings"
    class="nav-link"
    :class="{ 'active': $route.name === 'admin-site-settings' }"
  >
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0 6v2m0-2a2 2 0 100-4m0 4a2 2 0 110-4"></path>
    </svg>
    Conteúdo da Home
  </router-link> 