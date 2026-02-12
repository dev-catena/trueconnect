# Notas de Conversão Flutter para React Native

## Estrutura convertida:

### ✅ Core
- API Provider (Axios)
- Tema e cores
- Context API para gerenciamento de estado
- Navegação (React Navigation)
- Utilitários (CPF validator, date parser)

### ✅ Features Convertidas
- Login Screen
- Home Screen (básico)
- Contracts Screen (básico)
- Connection Panel Screen (básico)
- Register Screen (estrutura)
- Profile Screen (básico)
- New Password Screen (estrutura)

### ⚠️ Pendências

1. **Dependências a instalar:**
```bash
npm install react-native-vector-icons
npm install react-native-masked-text
npm install @react-native-async-storage/async-storage
```

2. **Configuração de ícones:**
   - Instalar react-native-vector-icons
   - Configurar fontes no Android e iOS

3. **Implementações pendentes:**
   - Formulário completo de cadastro
   - Formulário completo de novo contrato
   - Detalhes completos de contratos
   - Detalhes completos de conexões
   - Componentes reutilizáveis (cards, dialogs, etc.)
   - Filtros e busca
   - Refresh pull-to-refresh

4. **Assets:**
   - Copiar logo: `truste-me/assets/imgs/trustme-logo.png` → `trustme-app/assets/images/`

5. **Configuração nativa:**
   - Configurar AndroidManifest.xml
   - Configurar Info.plist (iOS)
   - Configurar permissões necessárias

## Diferenças principais Flutter → React Native:

1. **Estado:** BLoC/Cubit → Context API (pode migrar para Redux/Zustand depois)
2. **Navegação:** GoRouter → React Navigation
3. **HTTP:** http package → Axios
4. **Storage:** SharedPreferences → AsyncStorage
5. **UI:** Material Widgets → React Native Paper + componentes nativos

## Próximos passos recomendados:

1. Instalar dependências: `npm install`
2. Configurar projeto nativo (Android/iOS)
3. Testar login e navegação básica
4. Implementar funcionalidades restantes gradualmente
5. Adicionar testes





