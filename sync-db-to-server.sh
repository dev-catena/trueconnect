#!/bin/bash
# Sincroniza o banco local para o servidor via mysqldump + mysql
# Exige: mysqldump local, ssh/scp no servidor, php artisan
# Uso: ./sync-db-to-server.sh

set -e
SERVER="10.102.0.30"
SSH_USER="darley"
SSH_PASS="yhvh77"
# Caminho do projeto Laravel no servidor
REMOTE_PATH="/home/darley/trueconnect/trustme-back"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMP_FILE="/tmp/trustme_sync_$(date +%Y%m%d_%H%M%S).sql"

# Credenciais locais
if [ -f "$SCRIPT_DIR/trustme-back/.env" ]; then
  set -a
  source "$SCRIPT_DIR/trustme-back/.env" 2>/dev/null || true
  set +a
fi
LOCAL_DB_HOST="${DB_HOST:-127.0.0.1}"
LOCAL_DB_NAME="${DB_DATABASE:-trustme}"
LOCAL_DB_USER="${DB_USERNAME:-trustme}"
LOCAL_DB_PASS="${DB_PASSWORD:-Tm012345#}"

run_ssh() {
  sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SERVER} "$@"
}

echo "=== 1. Exportando banco local ($LOCAL_DB_NAME) ==="
mysqldump -h "$LOCAL_DB_HOST" -u "$LOCAL_DB_USER" -p"$LOCAL_DB_PASS" \
  --single-transaction --add-drop-table \
  --set-charset --default-character-set=utf8mb4 \
  "$LOCAL_DB_NAME" 2>/dev/null > "$DUMP_FILE"

if [ ! -s "$DUMP_FILE" ]; then
  echo "Erro: Dump vazio. Verifique trustme-back/.env"
  exit 1
fi
echo "   Dump: $(wc -l < "$DUMP_FILE") linhas, $(du -h "$DUMP_FILE" | cut -f1)"

echo ""
echo "=== 2. Enviando dump + comando DbImportDump para o servidor ==="
sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no \
  "$DUMP_FILE" \
  "${SSH_USER}@${SERVER}:/tmp/trustme_sync.sql"
sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no \
  "$SCRIPT_DIR/trustme-back/app/Console/Commands/DbImportDump.php" \
  "${SSH_USER}@${SERVER}:${REMOTE_PATH}/app/Console/Commands/"

echo ""
echo "=== 3. Importando no servidor ==="
run_ssh "cd ${REMOTE_PATH} && php artisan db:wipe --force"
run_ssh "cd ${REMOTE_PATH} && php artisan db:import-dump /tmp/trustme_sync.sql"
run_ssh "rm -f /tmp/trustme_sync.sql"

rm -f "$DUMP_FILE"

echo ""
echo "=== Sincronização concluída ==="
echo "Banco em ${SERVER} está idêntico ao local."
