# Serviços systemd para TrustMe no servidor 10.102.0.30

Estes serviços garantem que, ao reiniciar a máquina, subam automaticamente:
- **Backend Laravel** (API)
- **Frontend Vue** (plataforma web)
- **Reverb** (WebSocket usado pelo app React Native)
- **MySQL** (banco de dados)

O **app React Native** roda no celular do usuário. Ele só precisa que a API e o Reverb estejam disponíveis no servidor — não há processo do app rodando no servidor.

## Como cada peça sobe

| Componente        | Como sobe                                  | Serviço systemd     |
|------------------|---------------------------------------------|---------------------|
| **Backend Laravel** | nginx encaminha /api → PHP-FPM → Laravel | nginx + php-fpm     |
| **Frontend Vue** | nginx serve arquivos estáticos (dist/)      | nginx               |
| **App React Native** | Roda no celular; conecta à API e ao WebSocket | — (cliente)     |
| **WebSocket (Reverb)** | Processo dedicado na porta 8080             | trustme-reverb      |
| **Banco de dados** | MySQL/MariaDB                               | mysql / mariadb     |

## Serviços envolvidos

| Serviço            | O que disponibiliza              | Início automático |
|--------------------|----------------------------------|-------------------|
| nginx              | Plataforma web (Vue) + proxy API | Sim (systemd)     |
| php8.3-fpm         | Backend Laravel (API)            | Sim (systemd)     |
| mysql              | Banco de dados                   | Sim (systemd)     |
| trustme-reverb     | WebSocket (usado pelo app)       | Sim (unit custom) |
| trustme-expo       | Expo/Metro (dev server do app)   | Sim (unit custom) |

## Instalação

Execute o script de setup no servidor (ou use o deploy remoto):

```bash
# Opção 1: Pelo deploy (executa localmente com acesso SSH ao servidor)
./setup-services-on-server.sh

# Opção 2: Manualmente no servidor
sudo cp systemd/trustme-reverb.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable trustme-reverb nginx php8.3-fpm
sudo systemctl start trustme-reverb
```

## Comandos úteis

```bash
# Status do Reverb
sudo systemctl status trustme-reverb

# Reiniciar Reverb
sudo systemctl restart trustme-reverb

# Logs do Reverb
sudo journalctl -u trustme-reverb -f
```
