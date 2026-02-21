# ✅ Configuração da Porta 8000 - Resumo

## Status: ✅ CONCLUÍDO

### Backend Laravel
- ✅ **Porta**: 8000
- ✅ **URL**: `http://localhost:8000`
- ✅ **Status**: Rodando (PID: verificar com `lsof -i :8000`)
- ✅ **Script**: `trustme-back/start-server.sh`

### Frontend Web (Vue.js)
- ✅ **Proxy Vite**: Configurado para `http://localhost:8000`
- ✅ **Arquivo**: `trusteme-front/vite.config.js`
- ✅ **Comportamento**: Requisições para `/api` são redirecionadas para `http://localhost:8000/api`

### App React Native
- ✅ **Arquivo**: `trustme-app/src/utils/constants.ts`
- ✅ **API_HOST**: 10.102.0.103 (dispositivo) ou 10.0.2.2 (emulador Android)
- ✅ **API_PORT**: 8000

## 🚀 Como Usar

### 1. Iniciar o Backend
```bash
cd trustme-back
./start-server.sh
# ou
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Iniciar o Frontend Web
```bash
cd trusteme-front
npm run dev
# Acesse: http://localhost:5173
```

### 3. Iniciar o App React Native
```bash
cd trustme-app
npm start
# Em outro terminal:
npm run android  # ou npm run ios
```

## 📝 Notas Importantes

### Android Emulator
Se estiver usando emulador Android, altere em `trustme-app/src/utils/constants.ts`:
```typescript
export const API_HOST = '10.0.2.2'; // Emulador Android
```

### Dispositivo Físico
Para testar em dispositivo físico:
1. Descubra o IP da sua máquina: `ip addr show` ou `ifconfig`
2. Atualize API_HOST em `trustme-app/src/utils/constants.ts` para usar esse IP
3. Exemplo: API_HOST = '192.168.1.100'

## 🔍 Verificar se está funcionando

### Backend
```bash
curl http://localhost:8000/api
```

### Frontend Web
Abra o console do navegador e verifique se as requisições estão sendo feitas para `/api`

### App React Native
Verifique os logs do React Native para ver a URL base configurada

## 📚 Documentação Completa

Backend, frontend web e app usam exclusivamente a porta 8000.





