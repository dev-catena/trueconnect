# 🚀 Como Iniciar o App React Native

## ⚠️ Importante

Este projeto é **React Native CLI**, não Expo. Use os comandos do React Native, não do Expo.

## 📱 Comandos Disponíveis

### 1. Iniciar o Metro Bundler
```bash
npm start
```

**Nota**: Este projeto usa a **porta 8083** para permitir rodar junto com outras aplicações React Native nas portas 8081 e 8082.

Ou para limpar o cache:
```bash
npm run start:reset
# ou
npm start -- --reset-cache
```

### 2. Executar no Android
```bash
# Em um terminal: iniciar Metro
npm start

# Em outro terminal: executar no Android
npm run android
```

### 3. Executar no iOS (apenas Mac)
```bash
# Em um terminal: iniciar Metro
npm start

# Em outro terminal: executar no iOS
npm run ios
```

## 🔧 Pré-requisitos

### Android
- Android Studio instalado
- Android SDK configurado
- Emulador Android ou dispositivo físico conectado

### iOS (apenas Mac)
- Xcode instalado
- CocoaPods instalado
- Simulador iOS ou dispositivo físico

## 📝 Passos para Iniciar

### Primeira vez (setup inicial)

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Para iOS (apenas Mac):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Iniciar Metro Bundler:**
   ```bash
   npm start
   ```

4. **Em outro terminal, executar:**
   ```bash
   # Android
   npm run android
   
   # ou iOS (Mac)
   npm run ios
   ```

### Execuções subsequentes

1. **Iniciar Metro:**
   ```bash
   npm start
   ```

2. **Executar no dispositivo:**
   ```bash
   npm run android  # ou npm run ios
   ```

## 🐛 Problemas Comuns

### Cache do Metro
Se houver problemas, limpe o cache:
```bash
npm run start:reset
```

### Porta já em uso
Este projeto está configurado para usar a **porta 8083** por padrão, permitindo rodar junto com outras aplicações nas portas 8081 e 8082.

Se a porta 8083 também estiver em uso:
```bash
# Encontrar processo
lsof -ti:8083

# Matar processo
kill -9 $(lsof -ti:8083)

# Ou usar outra porta
npm start -- --port 8084
```

### Limpar build do Android
```bash
cd android
./gradlew clean
cd ..
```

### Limpar build do iOS
```bash
cd ios
rm -rf build
pod install
cd ..
```

## 🔗 Backend

Certifique-se de que o backend está rodando na porta 8001:
```bash
cd ../trustme-back
./start-server.sh
```

## 📱 Configuração do Dispositivo

### Android Emulator
- O app usará `localhost:8001` automaticamente
- Se não funcionar, altere no `ApiProvider.ts` para `10.0.2.2:8001`

### iOS Simulator
- O app usará `localhost:8001` automaticamente

### Dispositivo Físico
- Você precisará usar o IP da sua máquina
- Exemplo: `192.168.1.100:8001`
- Atualize no `ApiProvider.ts`

## ✅ Checklist

- [ ] Dependências instaladas (`npm install`)
- [ ] Backend rodando na porta 8001
- [ ] Metro Bundler iniciado (`npm start`)
- [ ] Emulador/dispositivo conectado
- [ ] App executado (`npm run android` ou `npm run ios`)

