# 🚀 Configuração Expo Go

## ✅ Conversão para Expo Concluída

O projeto foi convertido para usar **Expo Go**, permitindo testar rapidamente sem precisar compilar nativamente.

## 📦 Instalação

### 1. Instalar dependências
```bash
cd trustme-app
npm install
```

### 2. Instalar Expo CLI globalmente (opcional)
```bash
npm install -g expo-cli
```

## 🚀 Como Usar

### 1. Iniciar o servidor Expo
```bash
npm start
# ou
expo start
```

### 2. Escanear QR Code com Expo Go

#### Android
1. Instale o app **Expo Go** da Play Store
2. Abra o Expo Go
3. Escaneie o QR Code que aparece no terminal
4. Ou pressione `a` no terminal para abrir no Android

#### iOS
1. Instale o app **Expo Go** da App Store
2. Abra o Expo Go
3. Escaneie o QR Code que aparece no terminal
4. Ou pressione `i` no terminal para abrir no iOS Simulator

### 3. Comandos Disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run start:clear # Inicia com cache limpo
npm run android    # Abre no Android
npm run ios        # Abre no iOS Simulator
npm run web        # Abre no navegador
```

## 🔧 Configurações Realizadas

### 1. package.json
- ✅ Scripts atualizados para Expo
- ✅ Dependências compatíveis com Expo
- ✅ Versões ajustadas para Expo SDK 51

### 2. app.json
- ✅ Configuração do Expo adicionada
- ✅ Ícone e splash screen configurados
- ✅ Bundle identifiers configurados

### 3. index.js
- ✅ Atualizado para usar `registerRootComponent` do Expo

### 4. babel.config.js
- ✅ Configurado para usar `babel-preset-expo`

### 5. ApiProvider.ts
- ✅ Atualizado para detectar IP automaticamente no Expo Go
- ✅ Usa `Constants.expoConfig.hostUri` para detectar o servidor

## 📱 Expo Go vs Build Nativo

### Expo Go (Desenvolvimento)
- ✅ Teste rápido sem compilar
- ✅ Atualizações instantâneas
- ✅ Não precisa de Android Studio/Xcode
- ⚠️ Algumas bibliotecas nativas podem não funcionar

### Build Nativo (Produção)
- ✅ Acesso a todas as APIs nativas
- ✅ Melhor performance
- ✅ Pode publicar nas lojas
- ⚠️ Requer compilação

## 🔗 Backend

O app está configurado para se conectar ao backend na porta 8000.

### Expo Go detecta automaticamente:
- **Tunnel**: Usa `localhost:8001` (funciona com tunnel)
- **LAN**: Usa o IP da sua máquina automaticamente
- **Localhost**: Funciona no simulador/emulador

### Para desenvolvimento local:
1. Certifique-se de que o backend está rodando:
   ```bash
   cd ../trustme-back
   ./start-server.sh
   ```

2. Inicie o Expo:
   ```bash
   npm start
   ```

3. Escolha o modo de conexão:
   - **Tunnel**: Funciona de qualquer lugar (mais lento)
   - **LAN**: Mais rápido, precisa estar na mesma rede
   - **Localhost**: Apenas simulador/emulador

## 📝 Dependências Removidas/Substituídas

### Removidas (não compatíveis com Expo Go):
- `react-native-masked-text` - Use `expo-mask-text` ou implementação própria
- `react-native-vector-icons` - Use `@expo/vector-icons` (já incluído no Expo)

### Mantidas (compatíveis):
- ✅ `@react-native-async-storage/async-storage`
- ✅ `@react-native-community/datetimepicker`
- ✅ `@react-navigation/*`
- ✅ `react-native-paper`
- ✅ `axios`
- ✅ `date-fns`

## 🐛 Troubleshooting

### Expo Go não conecta
1. Verifique se está na mesma rede (modo LAN)
2. Use modo Tunnel se estiver em redes diferentes
3. Verifique o firewall

### Backend não acessível
1. Verifique se o backend está rodando na porta 8000
2. No Expo Go, o IP é detectado automaticamente
3. Se usar tunnel, o backend precisa estar acessível publicamente

### Erro de módulo não encontrado
```bash
npm run start:clear
# ou
rm -rf node_modules
npm install
```

## ✅ Checklist

- [x] Expo configurado
- [x] Dependências atualizadas
- [x] Scripts configurados
- [x] ApiProvider atualizado para Expo
- [ ] Expo Go instalado no dispositivo
- [ ] Backend rodando na porta 8000
- [ ] App testado no Expo Go

## 📚 Próximos Passos

1. **Testar no Expo Go**: Instale o app e teste todas as funcionalidades
2. **Build de desenvolvimento**: Se precisar de APIs nativas, faça um build de desenvolvimento
3. **Build de produção**: Quando estiver pronto, faça um build para publicação

## 🔗 Links Úteis

- [Documentação Expo](https://docs.expo.dev/)
- [Expo Go na Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [Expo Go na App Store](https://apps.apple.com/app/expo-go/id982107779)

