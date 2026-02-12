# TrustMe App - React Native

Aplicação React Native convertida do projeto Flutter original.

## Estrutura do Projeto

```
trustme-app/
├── src/
│   ├── core/           # Funcionalidades core (API, navegação, tema)
│   ├── features/       # Features da aplicação (login, contratos, etc.)
│   ├── components/     # Componentes reutilizáveis
│   ├── types/          # Definições de tipos TypeScript
│   └── utils/          # Utilitários
├── assets/             # Imagens e recursos
└── App.tsx            # Componente principal
```

## Instalação

1. Instalar dependências:
```bash
npm install
```

2. Para iOS (apenas no Mac):
```bash
cd ios && pod install && cd ..
```

3. Executar o app:
```bash
# Android
npm run android

# iOS
npm run ios
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:
```
API_HOST=api-trustme.catenasystem.com.br
```

## Estrutura de Features

Cada feature segue a estrutura:
- `screens/` - Telas da feature
- `components/` - Componentes específicos da feature
- `services/` - Serviços de dados da feature

## Navegação

A navegação usa React Navigation com:
- Stack Navigator para navegação principal
- Bottom Tabs para navegação entre Home e Contratos
- Nested Navigators para sub-rotas

## Estado Global

O estado global é gerenciado através de Context API no `UserContext`, que gerencia:
- Dados do usuário
- Contratos
- Conexões
- Autenticação

## Próximos Passos

1. Instalar dependências faltantes:
   - `react-native-vector-icons` para ícones
   - `react-native-masked-text` para máscaras de input
   - `@react-native-community/async-storage` (já incluído)

2. Configurar ícones nativos:
   - Android: adicionar fontes em `android/app/src/main/assets/fonts/`
   - iOS: adicionar fontes no Info.plist

3. Implementar funcionalidades restantes:
   - Formulário de cadastro completo
   - Formulário de novo contrato
   - Detalhes completos de contratos e conexões
   - Perfil do usuário

4. Testar integração com backend unificado





