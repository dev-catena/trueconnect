# 🔧 Configuração da Porta 8083

## ✅ Configuração Realizada

Este projeto está configurado para usar a **porta 8083** do Metro Bundler, permitindo rodar junto com outras aplicações React Native que usam as portas 8081 e 8082.

## 📝 O que foi alterado

### package.json
- `npm start` → Usa porta **8083**
- `npm run start:reset` → Usa porta **8083** com reset de cache
- `npm run start:default` → Usa porta padrão 8081 (se necessário)

## 🚀 Como usar

### 1. Iniciar o Metro na porta 8082
```bash
npm start
```

O Metro Bundler iniciará na porta **8083** e você verá:
```
Metro waiting on port 8083
```

### 2. Executar no Android
```bash
npm run android
```

**Importante**: Se você já tem o app instalado no dispositivo/emulador, pode ser necessário:

#### Opção A: Reinstalar o app
```bash
npm run android
```

#### Opção B: Configurar manualmente no Android
Se o app já estiver instalado e não conectar automaticamente:

1. Abra o app no dispositivo/emulador
2. Agite o dispositivo (ou pressione `Ctrl+M` no emulador)
3. Selecione "Settings" → "Debug server host & port for device"
4. Digite: `localhost:8083` (ou `10.0.2.2:8083` para emulador Android)

### 3. Executar no iOS
```bash
npm run ios
```

Para iOS, você pode precisar configurar manualmente:

1. Abra o app no simulador
2. Pressione `Cmd+D` para abrir o menu de debug
3. Selecione "Settings" → "Debug server host & port for device"
4. Digite: `localhost:8083`

## 🔍 Verificar se está funcionando

### Verificar porta do Metro
```bash
lsof -i :8083
```

Você deve ver algo como:
```
node  PID  USER  ... TCP *:8082 (LISTEN)
```

### Verificar no app
- Abra o app
- Agite o dispositivo (ou `Cmd+D` no iOS / `Ctrl+M` no Android)
- Verifique se o Metro está conectado

## 📱 Configuração Manual (se necessário)

### Android - Configurar via ADB
```bash
adb reverse tcp:8082 tcp:8082
```

### iOS - Configurar no código (temporário)
Se necessário, você pode adicionar no `index.js`:
```javascript
// Apenas para desenvolvimento
if (__DEV__) {
  require('react-native').NativeModules.DevSettings.setIsDebuggingRemotely(true);
}
```

## 🐛 Troubleshooting

### App não conecta ao Metro
1. Verifique se o Metro está rodando na porta 8083:
   ```bash
   lsof -i :8083
   ```

2. Verifique a configuração do servidor no app:
   - Android: Menu → Settings → Debug server host & port
   - iOS: Menu → Settings → Debug server host & port

3. Reinicie o Metro:
   ```bash
   npm run start:reset
   ```

### Porta 8083 já em uso
Se a porta 8083 também estiver em uso, você pode usar outra porta:
```bash
npm start -- --port 8084
```

E configure o app para usar essa porta.

## ✅ Checklist

- [x] Metro configurado para porta 8083
- [x] Scripts atualizados no package.json
- [ ] Metro iniciado (`npm start`)
- [ ] App configurado para usar porta 8083
- [ ] App conectado ao Metro

## 📚 Notas

- Outras aplicações continuam usando as portas 8081 e 8082 normalmente
- Esta aplicação usa a porta 8083
- Ambas podem rodar simultaneamente sem conflitos
- O backend continua na porta 8001

