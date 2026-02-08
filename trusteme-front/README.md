# Trust Me - Frontend

Frontend da aplicação Trust Me, uma plataforma de gestão de projetos e equipes.

## Tecnologias Utilizadas

- Vue 3
- Vite
- Tailwind CSS
- Pinia (Gerenciamento de Estado)
- Vue Router
- Axios

## Requisitos

- Node.js 16+
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/CelDarley/trusteme-fronf.git
cd trustme-fronf
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Exemplo (.env):
```
# Backend API
VITE_API_BASE_URL=https://consentir.catenasystem.com.br/api

# Se for necessário expor o Client ID no frontend para um fluxo direto (não usado atualmente)
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECT_URI=https://consentir.catenasystem.com.br/auth/google/callback

VITE_MERCADO_PAGO_ENV=sandbox
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
src/
  ├── assets/        # Arquivos estáticos
  ├── components/    # Componentes Vue reutilizáveis
  ├── router/        # Configuração do Vue Router
  ├── stores/        # Stores do Pinia
  ├── services/      # Serviços (API, etc)
  ├── views/         # Páginas/Views
  └── App.vue        # Componente raiz
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Visualiza a versão de produção localmente

## Backend

O backend deste projeto está disponível em: [trustme-back](https://github.com/CelDarley/trustme-back)

## Licença

MIT
