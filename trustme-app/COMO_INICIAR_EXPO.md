# 🚀 Como Iniciar o Expo com Node.js 20

## ✅ Problema Resolvido

O Expo SDK 54 requer Node.js 20+, e você tem Node.js 20.20.0 instalado via nvm.

## 🚀 Forma Mais Fácil: Usar o Script

```bash
cd trustme-app
./start-expo.sh
```

Este script automaticamente:
- Carrega o nvm
- Ativa Node.js 20
- Inicia o Expo na porta 8083

## 📝 Forma Manual

### 1. Ativar Node.js 20

```bash
# Carregar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usar Node.js 20
nvm use 20

# Verificar versão
node --version  # Deve mostrar v20.20.0
```

### 2. Iniciar o Expo

```bash
cd trustme-app
npx expo start --port 8083
```

## 🔧 Configuração Permanente (Opcional)

Para não precisar ativar o nvm toda vez, adicione ao seu `~/.bashrc` ou `~/.zshrc`:

```bash
# Carregar nvm automaticamente
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usar Node.js 20 por padrão
nvm use 20 2>/dev/null || true
```

Depois, recarregue:
```bash
source ~/.bashrc  # ou source ~/.zshrc
```

## 📱 Usar o App

1. **Aguarde o Metro Bundler compilar** (primeira vez pode levar alguns minutos)
2. **Escaneie o QR Code** que aparece no terminal com o app Expo Go
3. **Ou pressione:**
   - `a` - Abrir no Android
   - `i` - Abrir no iOS Simulator
   - `w` - Abrir no navegador

## ✅ Checklist

- [x] Node.js 20.20.0 instalado via nvm
- [x] Expo SDK 54 configurado
- [x] Dependências atualizadas
- [ ] Expo iniciado (`./start-expo.sh` ou manualmente)
- [ ] App conectado via Expo Go

## 🐛 Troubleshooting

### "nvm: command not found"
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### "Node.js 20 não encontrado"
```bash
nvm install 20
nvm use 20
```

### Ainda mostra Node.js 18
- Verifique: `which node`
- Use: `nvm use 20` antes de iniciar o Expo

## 📚 Documentação Adicional

- `NODE_VERSION_FIX.md` - Guia completo sobre versões do Node.js
- `EXPO_SETUP.md` - Configuração geral do Expo





