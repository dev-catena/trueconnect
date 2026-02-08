<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Cabeçalho da página -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Termos de Serviço
        </h1>
        <p class="text-xl text-gray-600">
          Última atualização: {{ new Date().toLocaleDateString('pt-BR') }}
        </p>
      </div>

      <!-- Conteúdo dos termos -->
      <div class="bg-white rounded-lg shadow-lg p-8 space-y-8">
        
        <!-- Introdução -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            1. Aceitação dos Termos
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Ao acessar e usar o aplicativo TrueConnect ("Serviço"), você aceita e concorda em cumprir 
            estes Termos de Serviço ("Termos"). Se você não concordar com qualquer parte destes termos, 
            não poderá acessar o Serviço.
          </p>
        </section>

        <!-- Descrição do serviço -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            2. Descrição do Serviço
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            O TrueConnect é uma plataforma de gerenciamento de projetos e colaboração em equipe que oferece:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Ferramentas de gestão de projetos</li>
            <li>Sistema de colaboração em equipe</li>
            <li>Gerenciamento de contratos e documentos</li>
            <li>Relatórios e análises</li>
            <li>Integração com outros sistemas</li>
            <li>Suporte técnico e treinamento</li>
          </ul>
        </section>

        <!-- Conta do usuário -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            3. Conta do Usuário
          </h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas, 
              completas e atualizadas. Você é responsável por:
            </p>
            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Manter a confidencialidade de sua senha</li>
              <li>Atividades que ocorrem em sua conta</li>
              <li>Notificar-nos imediatamente sobre uso não autorizado</li>
              <li>Garantir que sua conta seja usada apenas por você</li>
            </ul>
          </div>
        </section>

        <!-- Uso aceitável -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            4. Uso Aceitável
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Você concorda em usar o Serviço apenas para propósitos legais e de acordo com estes Termos. 
            Você não deve:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Usar o serviço para atividades ilegais ou fraudulentas</li>
            <li>Violar direitos de propriedade intelectual</li>
            <li>Transmitir vírus ou código malicioso</li>
            <li>Interferir no funcionamento do serviço</li>
            <li>Tentar acessar sistemas não autorizados</li>
            <li>Usar o serviço para spam ou conteúdo inadequado</li>
          </ul>
        </section>

        <!-- Propriedade intelectual -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            5. Propriedade Intelectual
          </h2>
          <p class="text-gray-700 leading-relaxed">
            O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade 
            exclusiva da TrueConnect e seus licenciadores. O Serviço é protegido por direitos autorais, 
            marcas registradas e outras leis de propriedade intelectual.
          </p>
        </section>

        <!-- Privacidade -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            6. Privacidade
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Sua privacidade é importante para nós. Nossa coleta e uso de informações pessoais estão 
            sujeitos à nossa Política de Privacidade, que é incorporada por referência a estes Termos. 
            Ao usar o Serviço, você concorda com a coleta e uso de informações conforme descrito na 
            Política de Privacidade.
          </p>
        </section>

        <!-- Pagamentos e assinaturas -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            7. Pagamentos e Assinaturas
          </h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Alguns recursos do Serviço podem estar disponíveis apenas mediante assinatura paga:
            </p>
            <ul class="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>As taxas são cobradas antecipadamente em base recorrente</li>
              <li>As assinaturas são renovadas automaticamente</li>
              <li>Você pode cancelar a qualquer momento</li>
              <li>Reembolsos são regidos pela nossa política de reembolso</li>
              <li>Reservamo-nos o direito de alterar preços com aviso prévio</li>
            </ul>
          </div>
        </section>

        <!-- Limitação de responsabilidade -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            8. Limitação de Responsabilidade
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Em nenhuma circunstância a TrueConnect será responsável por danos indiretos, incidentais, 
            especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou uso, incorridos 
            por você ou qualquer terceiro, mesmo se a TrueConnect tiver sido avisada da possibilidade de 
            tais danos.
          </p>
        </section>

        <!-- Garantias -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            9. Garantias
          </h2>
          <p class="text-gray-700 leading-relaxed">
            O Serviço é fornecido "como está" e "conforme disponível" sem garantias de qualquer tipo, 
            expressas ou implícitas. A TrueConnect não garante que o Serviço será ininterrupto, 
            livre de erros ou livre de vírus ou outros componentes prejudiciais.
          </p>
        </section>

        <!-- Indenização -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            10. Indenização
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Você concorda em indenizar e isentar a TrueConnect de qualquer reclamação, dano, obrigação, 
            perda, responsabilidade, custo ou dívida, e despesas (incluindo honorários advocatícios) 
            decorrentes de seu uso do Serviço ou violação destes Termos.
          </p>
        </section>

        <!-- Rescisão -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            11. Rescisão
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio ou responsabilidade, 
            por qualquer motivo, incluindo, sem limitação, se você violar estes Termos. Após a rescisão, 
            seu direito de usar o Serviço cessará imediatamente.
          </p>
        </section>

        <!-- Lei aplicável -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            12. Lei Aplicável
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar 
            seus conflitos de disposições legais. Qualquer disputa será resolvida nos tribunais competentes 
            de São Paulo, SP.
          </p>
        </section>

        <!-- Alterações nos termos -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            13. Alterações nos Termos
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. 
            Se uma revisão for material, forneceremos pelo menos 30 dias de aviso prévio antes de 
            qualquer novo termo entrar em vigor.
          </p>
        </section>

        <!-- Contato -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            14. Entre em Contato
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
          </p>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-gray-700">
              <strong>E-mail:</strong> termos@trueconnect.com<br>
              <strong>Telefone:</strong> (11) 99999-9999<br>
              <strong>Endereço:</strong> Rua dos Termos, 456 - São Paulo, SP - CEP: 01234-567
            </p>
          </div>
        </section>

      </div>

      <!-- Botão de voltar -->
      <div class="text-center mt-8">
        <router-link 
          to="/" 
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Voltar ao Início
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente de termos de serviço
</script>

<style scoped>
/* Estilos específicos para a página de termos de serviço */
</style> 