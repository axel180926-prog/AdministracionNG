# Script VPS Setup - VERSION 2 CORREGIDA
# Ejecutar: .\setup-vps-v2.ps1

$VPS_IP = "31.97.43.51"
$VPS_USER = "root"
$SSH_KEY = "$HOME\.ssh\vps_key"

Write-Host "`n=== SETUP VPS NEGOCIO ADMIN ===" -ForegroundColor Green
Write-Host "VPS: $VPS_USER@$VPS_IP" -ForegroundColor Cyan
Write-Host "SSH Key: $SSH_KEY`n" -ForegroundColor Cyan

# PASO 1: Generar clave SSH
Write-Host "PASO 1: Generando clave SSH..." -ForegroundColor Green

if (Test-Path $SSH_KEY) {
    Write-Host "  - Clave ya existe" -ForegroundColor Yellow
} else {
    Write-Host "  - Creando nueva clave..." -ForegroundColor Cyan
    ssh-keygen -t ed25519 -f $SSH_KEY -N "" 2>&1 | Out-Null
    Write-Host "  - Clave creada: $SSH_KEY" -ForegroundColor Green
}

# PASO 2: Copiar clave al VPS
Write-Host "`nPASO 2: Copiando clave al VPS..." -ForegroundColor Green

$pub_key = Get-Content "$SSH_KEY.pub" -ErrorAction SilentlyContinue
if ($pub_key) {
    Write-Host "  - Enviando clave pública..." -ForegroundColor Cyan
    $pub_key | ssh "$VPS_USER@$VPS_IP" "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" 2>&1
    Write-Host "  - Clave copiada" -ForegroundColor Green
} else {
    Write-Host "  - ERROR: No se encontró la clave pública" -ForegroundColor Red
    exit 1
}

# PASO 3: Verificar SSH
Write-Host "`nPASO 3: Verificando SSH sin contraseña..." -ForegroundColor Green

$test_ssh = ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "echo 'SSH_OK'" 2>&1
if ($test_ssh -contains "SSH_OK") {
    Write-Host "  - SSH sin contraseña: OK" -ForegroundColor Green
} else {
    Write-Host "  - Intenta manualmente:" -ForegroundColor Yellow
    Write-Host "    ssh -i $SSH_KEY $VPS_USER@$VPS_IP" -ForegroundColor Cyan
}

# PASO 4: Pedir contraseña PostgreSQL
Write-Host "`nPASO 4: Configurar PostgreSQL..." -ForegroundColor Green
Write-Host "  - Ingresa una contraseña segura (12+ caracteres):" -ForegroundColor Cyan
$db_password = Read-Host "    Contraseña"

if ($db_password.Length -lt 12) {
    Write-Host "  - ERROR: Contraseña muy corta (mínimo 12 caracteres)" -ForegroundColor Red
    exit 1
}

Write-Host "  - Contraseña guardada" -ForegroundColor Green

# PASO 5: Crear BD en VPS
Write-Host "`nPASO 5: Creando base de datos en VPS..." -ForegroundColor Green

$db_script = @"
sudo -u postgres psql << 'PSQL'
CREATE DATABASE negocio_admin_db;
CREATE USER negocio_admin_user WITH PASSWORD '$db_password';
ALTER ROLE negocio_admin_user SET client_encoding TO 'utf8';
ALTER ROLE negocio_admin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE negocio_admin_user CREATEDB;
\c negocio_admin_db
GRANT ALL PRIVILEGES ON SCHEMA public TO negocio_admin_user;
PSQL
echo "BASE DE DATOS CREADA"
"@

ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" $db_script 2>&1 | Out-Null
Write-Host "  - Base de datos creada" -ForegroundColor Green

# PASO 6: Resumen
Write-Host "`n=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "`nInformacion importante:" -ForegroundColor Cyan
Write-Host "  SSH Key:        $SSH_KEY" -ForegroundColor White
Write-Host "  DB User:        negocio_admin_user" -ForegroundColor White
Write-Host "  DB Name:        negocio_admin_db" -ForegroundColor White
Write-Host "  DB Password:    (la que ingresaste)" -ForegroundColor White

Write-Host "`nProximos pasos:" -ForegroundColor Green
Write-Host "  1. Verifica SSH: ssh -i $SSH_KEY $VPS_USER@$VPS_IP 'pm2 status'" -ForegroundColor Cyan
Write-Host "  2. Lee: NEXT_STEPS.md" -ForegroundColor Cyan
Write-Host "  3. Implementa Auth API" -ForegroundColor Cyan

Write-Host "`nListo!" -ForegroundColor Green
