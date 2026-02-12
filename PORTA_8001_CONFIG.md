# Configuração da Porta 8001

## ✅ Configurações Realizadas

### 1. Backend (Laravel)
- **Porta configurada**: 8001
- **URL**: `http://localhost:8001`
- **Script de inicialização**: `trustme-back/start-server.sh`

### 2. Frontend Web (Vue.js)
- **Proxy Vite atualizado**: Aponta para `http://localhost:8001`
- **Arquivo**: `trusteme-front/vite.config.js`
- **Configuração**: Usa `/api` que é redirecionado para `http://localhost:8001/api`

### 3. App React Native
- **Desenvolvimento**: `http://localhost:8001/api`
- **Produção**: `https://api-trustme.catenasystem.com.br/api`
- **Arquivo**: `trustme-app/src/core/api/ApiProvider.ts`
- **Detecção automática**: Usa `__DEV__` para alternar entre dev e produção

## 🚀 Como Iniciar o Backend

### Opção 1: Usando o script (Recomendado)
```bash
cd trustme-back
./start-server.sh
```

### Opção 2: Comando direto
```bash
cd trustme-back
php artisan serve --host=0.0.0.0 --port=8001
```

### Opção 3: Em background
```bash
cd trustme-back
php artisan serve --host=0.0.0.0 --port=8001 &
```

## 📱 Como Testar

### Frontend Web
1. Inicie o backend na porta 8001
2. Inicie o frontend:
   ```bash
   cd trusteme-front
   npm run dev
   ```
3. O frontend estará em `http://localhost:5173`
4. As requisições para `/api` serão redirecionadas para `http://localhost:8001/api`

### App React Native
1. Inicie o backend na porta 8001
2. Certifique-se de que o dispositivo/emulador pode acessar `localhost:8001`
   - **Emulador Android**: Use `10.0.2.2:8001` em vez de `localhost:8001`
   - **Emulador iOS**: Use `localhost:8001` normalmente
   - **Dispositivo físico**: Use o IP da sua máquina (ex: `192.168.1.100:8001`)

3. Para Android, você pode precisar atualizar o ApiProvider:
   ```typescript
   const HOST = IS_DEV ? '10.0.2.2:8001' : 'api-trustme.catenasystem.com.br';
   ```

## 🔧 Configurações Detalhadas

### Vite Config (trusteme-front/vite.config.js)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8001',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, '/api')
  }
}
```

### ApiProvider (trustme-app/src/core/api/ApiProvider.ts)
```typescript
const IS_DEV = __DEV__;
const HOST = IS_DEV ? 'localhost:8001' : 'api-trustme.catenasystem.com.br';
const PROTOCOL = IS_DEV ? 'http' : 'https';
const BASE_URL = `${PROTOCOL}://${HOST}/api`;
```

## ⚠️ Notas Importantes

1. **CORS**: O backend já está configurado para aceitar requisições de qualquer origem (`allowed_origins: ['*']`)

2. **Porta em uso**: Se a porta 8001 estiver em uso, o script `start-server.sh` avisará. Para liberar:
   ```bash
   lsof -ti:8001 | xargs kill
   ```

3. **Android Emulator**: Se estiver usando emulador Android, você precisará usar `10.0.2.2` em vez de `localhost`. Isso é um mapeamento especial do Android para o host da máquina.

4. **iOS Simulator**: O simulador iOS pode acessar `localhost` diretamente.

5. **Dispositivo Físico**: Para testar em dispositivo físico, você precisará:
   - Descobrir o IP da sua máquina: `ip addr show` ou `ifconfig`
   - Atualizar o HOST no ApiProvider para usar esse IP
   - Garantir que o dispositivo e a máquina estão na mesma rede

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se a porta 8001 está livre: `lsof -i :8001`
- Verifique se o PHP está instalado: `php -v`
- Verifique se as dependências estão instaladas: `composer install`

### Frontend não conecta
- Verifique se o backend está rodando: `curl http://localhost:8001/api`
- Verifique o console do navegador para erros de CORS
- Recarregue a página com Ctrl+Shift+R para limpar cache

### App não conecta
- Verifique se está usando o IP correto (para emulador/dispositivo físico)
- Verifique os logs do React Native para erros de conexão
- Teste a URL diretamente: `curl http://localhost:8001/api` (ou IP correspondente)

## 📝 Checklist

- [x] Backend configurado para porta 8001
- [x] Frontend web apontando para porta 8001 via proxy
- [x] App React Native configurado para usar localhost:8001 em desenvolvimento
- [x] Script de inicialização criado
- [x] CORS configurado corretamente





