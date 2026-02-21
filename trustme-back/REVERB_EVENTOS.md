# Eventos Laravel Reverb (WebSocket)

Eventos broadcast em tempo real via Laravel Reverb. Requer `BROADCAST_DRIVER=reverb` no `.env` e o servidor Reverb em execução (`./start-reverb.sh` ou `php artisan reverb:start`).

## Canais

| Canal | Autorização | Uso |
|-------|-------------|-----|
| `user.{id}` | Usuário autenticado (`id` = seu ID) | Canal privado por usuário |

## Eventos

### `contrato.atualizado`
**Classe:** `App\Events\ContratoAtualizado`  
**Canal:** `user.{id}` (contratante + participantes)  
**Disparo:** Criação, assinatura ou atualização geral do contrato  

**Payload:**
```json
{
  "id": 1,
  "codigo": "CONT-001",
  "status": "Pendente",
  "acao": "criado|assinado|atualizado",
  "contratante_id": 1
}
```

### `clausula.contrato.atualizada`
**Classe:** `App\Events\ClausulaContratoAtualizada`  
**Canal:** `user.{id}` (contratante + participantes)  
**Disparo:** Quando uma parte altera **Concordar** ou **Discordar** em uma cláusula  

**Payload:**
```json
{
  "contrato_id": 1,
  "clausula_id": 5,
  "usuario_id": 2,
  "aceito": true
}
```
- `aceito: true` = concordou
- `aceito: false` = discordou
- `aceito: null` = voltou a pendente

**Onde dispara:** `ContratoClausulaController::aceitarClausula`  
**Onde escuta:** App React Native – `ContractDetailScreen` (atualização em tempo real para a outra parte)

### `seal_request.atualizado`
**Classe:** `App\Events\SealRequestAtualizado`  
**Canal:** `seal-requests` (admin/servicedesk)  
**Disparo:** Aprovação, rejeição, revogação, exclusão de solicitações de selos  

### `conexao.criada` / `conexao.atualizada` / `conexao.removida`
**Canais:** `user.{id}`  
**Disparo:** Criação, atualização ou remoção de conexões entre usuários  
