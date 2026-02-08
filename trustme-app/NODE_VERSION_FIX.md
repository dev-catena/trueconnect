# 🔧 Como Usar Node.js 20 com Expo

## Problema

O shell está usando Node.js 18.19.1, mas você tem Node.js 20.20.0 instalado. O Expo SDK 54 requer Node.js 20+.

## Soluções

### Opção 1: Usar o script start-expo.sh (Recomendado)

```bash
cd trustme-app
./start-expo.sh
```

Este script tenta automaticamente usar Node.js 20 via nvm.

### Opção 2: Ativar Node.js 20 manualmente

#### Se você tem nvm instalado:

```bash
# Carregar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usar Node.js 20
nvm use 20
# ou
nvm use 20.20.0

# Verificar versão
node --version  # Deve mostrar v20.20.0

# Iniciar Expo
cd trustme-app
npx expo start --port 8083
```

#### Se Node.js 20 está em outro local:

```bash
# Encontrar onde está o Node.js 20
which -a node
/usr/bin/node --version
/usr/local/bin/node --version

# Se encontrar Node.js 20 em outro local, adicionar ao PATH:
export PATH="/caminho/para/node20/bin:$PATH"

# Verificar
node --version

# Iniciar Expo
cd trustme-app
npx expo start --port 8083
```

### Opção 3: Adicionar ao .bashrc ou .zshrc

Adicione estas linhas ao seu `~/.bashrc` ou `~/.zshrc`:

```bash
# Carregar nvm automaticamente
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usar Node.js 20 por padrão
nvm use 20 2>/dev/null || true
```

Depois, recarregue o shell:
```bash
source ~/.bashrc  # ou source ~/.zshrc
```

## Verificar Versão

Sempre verifique a versão antes de iniciar o Expo:

```bash
node --version  # Deve ser v20.20.0 ou superior
```

## Comandos Rápidos

```bash
# Verificar versão atual
node --version

# Se tiver nvm
nvm list          # Ver versões instaladas
nvm use 20        # Usar Node.js 20
nvm alias default 20  # Definir Node.js 20 como padrão

# Iniciar Expo
cd trustme-app
npx expo start --port 8083
```

## Troubleshooting

### "nvm: command not found"
- Instale o nvm: https://github.com/nvm-sh/nvm
- Ou use o caminho completo do Node.js 20

### "Node.js 20 não encontrado"
- Instale Node.js 20: `nvm install 20`
- Ou baixe de https://nodejs.org/

### Ainda mostra Node.js 18
- Verifique qual node está sendo usado: `which node`
- Verifique o PATH: `echo $PATH`
- Use o caminho completo do Node.js 20


