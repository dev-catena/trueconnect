# ⚠️ Atualização para Expo SDK 54

## Problema Identificado

O Expo SDK 54 requer **Node.js 20.19.4 ou superior**, mas você está usando **Node.js 18.19.1**.

## Soluções

### Opção 1: Atualizar Node.js (Recomendado)

1. **Instalar Node.js 20 ou superior:**
   ```bash
   # Usando nvm (recomendado)
   nvm install 20
   nvm use 20
   
   # Ou baixar de https://nodejs.org/
   ```

2. **Verificar a versão:**
   ```bash
   node --version  # Deve ser 20.19.4 ou superior
   ```

3. **Reinstalar dependências:**
   ```bash
   cd trustme-app
   rm -rf node_modules package-lock.json
   npm install
   npx expo install --fix
   ```

4. **Iniciar o Expo:**
   ```bash
   npx expo start --port 8083
   ```

### Opção 2: Usar SDK 51 (Alternativa)

Se não puder atualizar o Node.js agora, você pode voltar para SDK 51:

1. **Atualizar package.json:**
   ```json
   "expo": "~51.0.14"
   ```

2. **Reinstalar dependências:**
   ```bash
   cd trustme-app
   rm -rf node_modules package-lock.json
   npm install
   npx expo install --fix
   ```

3. **Nota**: Você precisará usar um simulador iOS ou uma versão antiga do Expo Go para SDK 51.

## Status Atual

- ✅ Expo atualizado para SDK 54 no package.json
- ✅ Dependências atualizadas para SDK 54
- ❌ Node.js 18.19.1 (requer 20.19.4+)
- ❌ Metro config com erro devido à versão do Node.js

## Próximos Passos

1. **Atualizar Node.js para versão 20+**
2. **Reinstalar dependências**
3. **Iniciar o Expo**

## Comandos Rápidos

```bash
# Verificar versão do Node.js
node --version

# Se tiver nvm instalado
nvm install 20
nvm use 20

# Reinstalar dependências
cd trustme-app
rm -rf node_modules package-lock.json
npm install
npx expo install --fix

# Iniciar Expo
npx expo start --port 8083
```





