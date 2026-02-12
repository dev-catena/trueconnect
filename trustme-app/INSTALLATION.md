# Guia de Instalação - TrustMe App React Native

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm ou yarn
- Android Studio (para Android)
- Xcode (para iOS - apenas Mac)

## Instalação

1. **Instalar dependências:**
```bash
cd trustme-app
npm install
```

2. **Instalar dependências nativas (iOS - apenas Mac):**
```bash
cd ios
pod install
cd ..
```

3. **Copiar assets:**
```bash
# Copiar logo
cp ../truste-me/assets/imgs/trustme-logo.png assets/images/
```

## Executar o App

### Android
```bash
npm run android
```

### iOS (apenas Mac)
```bash
npm run ios
```

## Configuração do Backend

O app está configurado para usar o backend unificado em `trustme-back`. Certifique-se de que:

1. O backend está rodando
2. A URL da API está correta em `src/core/api/ApiProvider.ts`
3. O CORS está configurado para aceitar requisições do app

## Estrutura do Projeto

```
trustme-app/
├── src/
│   ├── core/              # Funcionalidades core
│   │   ├── api/           # API Provider
│   │   ├── context/       # Context API (estado global)
│   │   ├── navigation/    # Configuração de navegação
│   │   ├── colors.ts      # Cores customizadas
│   │   └── theme.ts       # Tema do app
│   ├── features/          # Features da aplicação
│   │   ├── login/         # Tela de login
│   │   ├── home/          # Tela inicial
│   │   ├── contracts/     # Contratos
│   │   ├── connection/    # Conexões
│   │   ├── register/      # Cadastro
│   │   ├── profile/       # Perfil
│   │   └── newPassword/   # Nova senha
│   ├── types/             # Definições TypeScript
│   └── utils/             # Utilitários
├── assets/                # Imagens e recursos
└── App.tsx               # Componente principal
```

## Próximos Passos

1. **Instalar dependências adicionais:**
   - `react-native-vector-icons` para ícones
   - Configurar fontes nativas

2. **Implementar funcionalidades:**
   - Formulários completos (cadastro, novo contrato)
   - Componentes reutilizáveis
   - Filtros e busca
   - Pull-to-refresh

3. **Testar integração:**
   - Testar login
   - Testar navegação
   - Testar chamadas de API

## Notas Importantes

- O app usa o backend unificado em `trustme-back`
- A autenticação é feita via token (Sanctum)
- O estado é gerenciado via Context API
- A navegação usa React Navigation





