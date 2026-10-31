#!/usr/bin/env bash
# Create a small Windows VM for building the Power BI report in Power BI Desktop.
# Runs on Azure for Students credit; shuts itself down every night.
#
#   ./analytics/azure/create_vm.sh            # create (safe to re-run)
#   az group delete -n nyc311-rg ...          # don't: that also deletes the database
#   ./analytics/azure/create_vm.sh delete     # remove the VM, its disk and network pieces
set -euo pipefail

RESOURCE_GROUP="nyc311-rg"
LOCATION="canadacentral"
VM="nyc311-pbi"
SIZE="Standard_B2ms"                   # 2 vCPU, 8 GB RAM; 4 GB is too little for Power BI Desktop
IMAGE="MicrosoftWindowsServer:WindowsServer:2022-datacenter-smalldisk-g2:latest"
ADMIN_USER="nyc311"
SHUTDOWN_UTC="0400"                    # 11 PM Eastern (midnight during daylight time)
PBI_URL="https://download.microsoft.com/download/8/8/0/880BCA75-79DD-466A-927D-1ABF1F5454B0/PBIDesktopSetup_x64.exe"
ENV_FILE="$(cd "$(dirname "$0")/../.." && pwd)/.env"

if [[ "${1:-}" == "delete" ]]; then
  echo "Deleting $VM and its disk, NIC, IP and security group"
  az vm delete -g "$RESOURCE_GROUP" -n "$VM" --yes -o none
  for disk in $(az disk list -g "$RESOURCE_GROUP" --query "[?starts_with(name, '$VM')].id" -o tsv); do
    az disk delete --yes --ids "$disk" -o none
  done
  az network nic delete -g "$RESOURCE_GROUP" -n "${VM}VMNic" -o none 2>/dev/null || true
  az network public-ip delete -g "$RESOURCE_GROUP" -n "${VM}PublicIP" -o none 2>/dev/null || true
  az network nsg delete -g "$RESOURCE_GROUP" -n "${VM}NSG" -o none 2>/dev/null || true
  az network vnet delete -g "$RESOURCE_GROUP" -n "${VM}VNET" -o none 2>/dev/null || true
  echo "Done. The Azure SQL database is untouched."
  exit 0
fi

PASSWORD="$(grep -E '^AZURE_VM_PASSWORD=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)"
if [[ -z "$PASSWORD" ]]; then
  PASSWORD="Pbi-$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9')9!"
  printf '\n# Windows VM for Power BI Desktop (analytics/azure/create_vm.sh)\nAZURE_VM_USER=%s\nAZURE_VM_PASSWORD=%s\n' "$ADMIN_USER" "$PASSWORD" >> "$ENV_FILE"
fi

MY_IP="$(curl -s -m 10 https://api.ipify.org || curl -s -m 10 https://checkip.amazonaws.com || true)"
MY_IP="$(echo "$MY_IP" | tr -d '[:space:]')"
[[ -n "$MY_IP" ]] || { echo "Could not detect your public IP" >&2; exit 1; }

if ! az vm show -g "$RESOURCE_GROUP" -n "$VM" -o none 2>/dev/null; then
  echo "Creating $VM ($SIZE, Windows Server 2022)"
  az vm create -g "$RESOURCE_GROUP" -n "$VM" -l "$LOCATION" \
    --image "$IMAGE" --size "$SIZE" \
    --admin-username "$ADMIN_USER" --admin-password "$PASSWORD" \
    --os-disk-size-gb 64 --storage-sku StandardSSD_LRS \
    --public-ip-sku Standard --nsg-rule RDP -o none
fi

echo "Allowing Remote Desktop only from $MY_IP"
az network nsg rule update -g "$RESOURCE_GROUP" --nsg-name "${VM}NSG" -n rdp \
  --source-address-prefixes "$MY_IP" -o none

echo "Scheduling nightly shutdown at $SHUTDOWN_UTC UTC"
az vm auto-shutdown -g "$RESOURCE_GROUP" -n "$VM" --time "$SHUTDOWN_UTC" -o none

echo "Installing Power BI Desktop (takes a few minutes)"
az vm run-command invoke -g "$RESOURCE_GROUP" -n "$VM" --command-id RunPowerShellScript --scripts "
\$ProgressPreference = 'SilentlyContinue'
if (-not (Test-Path 'C:\Program Files\Microsoft Power BI Desktop\bin\PBIDesktop.exe')) {
  Invoke-WebRequest -Uri '$PBI_URL' -OutFile C:\PBIDesktopSetup_x64.exe
  Start-Process C:\PBIDesktopSetup_x64.exe -ArgumentList '-quiet','-norestart','ACCEPT_EULA=1' -Wait
}
if (Test-Path 'C:\Program Files\Microsoft Power BI Desktop\bin\PBIDesktop.exe') { 'Power BI Desktop installed' } else { 'Power BI Desktop install FAILED' }
" --query "value[0].message" -o tsv

IP="$(az vm show -d -g "$RESOURCE_GROUP" -n "$VM" --query publicIps -o tsv)"
echo
echo "Ready. Connect with Windows App: PC name $IP, user $ADMIN_USER, password AZURE_VM_PASSWORD in .env"
