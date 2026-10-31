#!/usr/bin/env bash
# Create the Azure SQL analytics database on the free offer and save its
# connection details to the repo's .env (which is gitignored).
#
#   az login
#   ./analytics/azure/provision.sh [location]
#
# Re-running is safe: existing resources are reused, and the password is only
# generated the first time.
set -euo pipefail

LOCATION="${1:-canadacentral}"
RESOURCE_GROUP="nyc311-rg"
DATABASE="nyc311-analytics"
ADMIN_USER="nyc311admin"
ENV_FILE="$(cd "$(dirname "$0")/../.." && pwd)/.env"

env_value() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || true; }
set_env() {
  if grep -qE "^$1=" "$ENV_FILE" 2>/dev/null; then
    sed -i '' "s|^$1=.*|$1=$2|" "$ENV_FILE"
  else
    printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE"
  fi
}

SERVER_FQDN="$(env_value AZURE_SQL_SERVER)"
SERVER="${SERVER_FQDN%%.*}"
if [[ -z "$SERVER" || "$SERVER" == "your-server" ]]; then
  SERVER="nyc311-sql-$(openssl rand -hex 3)"
fi
PASSWORD="$(env_value AZURE_SQL_PASSWORD)"
if [[ -z "$PASSWORD" || "$PASSWORD" == "put_password_here" ]]; then
  PASSWORD="N3w-$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9')!"
fi

echo "Subscription: $(az account show --query name -o tsv)"
echo "Creating resource group $RESOURCE_GROUP in $LOCATION"
az group create -n "$RESOURCE_GROUP" -l "$LOCATION" -o none

if ! az sql server show -g "$RESOURCE_GROUP" -n "$SERVER" -o none 2>/dev/null; then
  echo "Creating SQL server $SERVER"
  az sql server create -g "$RESOURCE_GROUP" -n "$SERVER" -l "$LOCATION" \
    --admin-user "$ADMIN_USER" --admin-password "$PASSWORD" \
    --minimal-tls-version 1.2 -o none
fi

echo "Opening the firewall to Azure services (Fabric/Power BI) and this machine"
az sql server firewall-rule create -g "$RESOURCE_GROUP" -s "$SERVER" \
  -n AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0 -o none
MY_IP="$(curl -s https://api.ipify.org)"
az sql server firewall-rule create -g "$RESOURCE_GROUP" -s "$SERVER" \
  -n DevMachine --start-ip-address "$MY_IP" --end-ip-address "$MY_IP" -o none

if ! az sql db show -g "$RESOURCE_GROUP" -s "$SERVER" -n "$DATABASE" -o none 2>/dev/null; then
  echo "Creating database $DATABASE (free offer, pauses when idle)"
  az sql db create -g "$RESOURCE_GROUP" -s "$SERVER" -n "$DATABASE" \
    --edition GeneralPurpose --family Gen5 --capacity 2 \
    --compute-model Serverless --auto-pause-delay 60 \
    --use-free-limit --free-limit-exhaustion-behavior AutoPause \
    --backup-storage-redundancy Local -o none
fi

set_env AZURE_SQL_SERVER "$SERVER.database.windows.net"
set_env AZURE_SQL_DATABASE "$DATABASE"
set_env AZURE_SQL_USER "$ADMIN_USER"
set_env AZURE_SQL_PASSWORD "$PASSWORD"

echo
echo "Done. Server: $SERVER.database.windows.net  Database: $DATABASE  User: $ADMIN_USER"
echo "Connection details were written to .env. Next: docker compose --profile analytics run --rm azure-sync"
