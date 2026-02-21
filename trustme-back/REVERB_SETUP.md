# Como subir o Reverb e deixar tudo funcionando

O Laravel Reverb é o servidor WebSocket que permite eventos em tempo real (ex.: atualização de contrato, conexões, cláusulas). Segue o passo a passo para configurar e rodar.

---

## 1. Configurar o `.env`

No `trustme-back`, certifique-se de ter estas variáveis no `.env`:

```env
BROADCAST_DRIVER=reverb

REVERB_APP_ID=1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
REVERB_APP_KEY=imxxjvrqkkqflvbcppeo
REVERB_APP_SECRET=imxxjvrqkkqflvbcppeo
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

**Importante:** `REVERB_APP_KEY` e `REVERB_APP_SECRET` precisam ser os mesmos usados no app (`WebSocketService.ts`). O app usa `imxxjvrqkkqflvbcppeo` por padrão.

---

## 2. Instalar o Reverb (se ainda não estiver)

```bash
cd trustme-back
composer require laravel/reverb
php artisan reverb:install
```

Se já estiver instalado (já existe `config/reverb.php`), ignore este passo.

---

## 3. Subir os serviços

Um único comando inicia **Laravel + Reverb**:

```bash
cd trustme-back
./start-server.sh
```

O script sobe:
- **Laravel** (API) na porta 8000
- **Reverb** (WebSocket) na porta 8080

Ao pressionar `Ctrl+C`, ambos são encerrados.

---

## 4. Verificar se está funcionando

### Backend (Laravel)

- Acesse `http://localhost:8000` no navegador.

### Reverb (WebSocket)

- No terminal onde o Reverb está rodando, você deve ver algo como:
  ```
  Reverb server started on 0.0.0.0:8080
  ```

---

## 5. App mobile (trustme-app)

O app usa o mesmo host da API para o WebSocket. Em `trustme-app/src/utils/constants.ts`:

```ts
export const API_HOST = '10.102.0.103';  // IP da sua máquina na rede local
```

O `WebSocketService` conecta em `ws://{API_HOST}:8080`, ou seja, `ws://10.102.0.103:8080`.

- **Emulador Android:** use `10.0.2.2` no lugar da máquina
- **Dispositivo físico:** use o IP da sua máquina na rede (ex.: `10.102.0.103`)
- **Simulador iOS:** pode usar `localhost` se estiver tudo na mesma máquina

---

## 6. Resumo rápido

```bash
./start-server.sh
```

| Serviço  | Porta |
|----------|-------|
| Laravel  | 8000  |
| Reverb   | 8080  |

Para que:

- a API responda normalmente
- o app receba eventos WebSocket (contratos, conexões, cláusulas)

---

## Problemas comuns

### Reverb não inicia

- Confirme que a porta 8080 está livre: `lsof -i :8080`
- Se estiver em uso: `lsof -ti:8080 | xargs kill`

### App não recebe eventos

1. Conferir se `BROADCAST_DRIVER=reverb` no `.env`
2. Conferir se `REVERB_APP_KEY` no backend é o mesmo do app
3. Conferir se `API_HOST` em `constants.ts` aponta para o IP correto da máquina

### CORS / conexão recusada

- Reverb deve escutar em `0.0.0.0` para aceitar conexões de outros dispositivos na rede
- O script `start-reverb.sh` já usa `--host=0.0.0.0 --port=8080`
