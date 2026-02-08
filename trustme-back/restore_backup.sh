#!/bin/bash

# Script para restaurar backup do banco de dados trustme
# Uso: ./restore_backup.sh /caminho/para/backup.sql

DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_DATABASE="trustme"
DB_USERNAME="trustme"
DB_PASSWORD="Tm012345#"

if [ -z "$1" ]; then
    echo "❌ Erro: Por favor, forneça o caminho para o arquivo de backup SQL"
    echo "Uso: $0 /caminho/para/backup.sql"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erro: Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "📦 Restaurando backup do banco de dados..."
echo "Arquivo: $BACKUP_FILE"
echo "Banco: $DB_DATABASE"
echo ""

# Fazer backup do estado atual antes de restaurar
CURRENT_BACKUP="backup_before_restore_$(date +%Y%m%d_%H%M%S).sql"
echo "💾 Criando backup do estado atual em: $CURRENT_BACKUP"
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" > "$CURRENT_BACKUP" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Backup do estado atual criado com sucesso"
else
    echo "⚠️  Aviso: Não foi possível criar backup do estado atual"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Restaurar o backup
echo ""
echo "🔄 Restaurando backup..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Backup restaurado com sucesso!"
    echo ""
    echo "📊 Verificando usuários restaurados..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "SELECT COUNT(*) as total_usuarios FROM users;" 2>/dev/null
    echo ""
    echo "✅ Restauração concluída!"
else
    echo "❌ Erro ao restaurar backup. Verifique as credenciais e o arquivo de backup."
    exit 1
fi

