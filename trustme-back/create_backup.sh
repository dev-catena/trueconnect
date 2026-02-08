#!/bin/bash

# Script para criar backup do banco de dados trustme

DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_DATABASE="trustme"
DB_USERNAME="trustme"
DB_PASSWORD="Tm012345#"

BACKUP_DIR="database/backups"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/trustme_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Criando backup do banco de dados..."
echo "Banco: $DB_DATABASE"
echo "Arquivo: $BACKUP_FILE"
echo ""

mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
else
    echo "❌ Erro ao criar backup. Verifique as credenciais do banco de dados."
    exit 1
fi

