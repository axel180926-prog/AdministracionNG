#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script para subir proyecto a GitHub automáticamente

.DESCRIPTION
    Automatiza el proceso de agregar archivos, hacer commit y push

.EXAMPLE
    .\push-to-github.ps1
    .\push-to-github.ps1 -Message "Mi mensaje personalizado"

.NOTES
    Requisitos:
    - Git instalado
    - Remoto configurado (git remote add origin ...)
#>

param(
    [string]$Message = "Update: Cambios en el proyecto",
    [string]$GitUser = "",
    [string]$GitEmail = ""
)

Write-Host "`n🚀 Script de Push a GitHub`n" -ForegroundColor Cyan

# 1. Verificar Git instalado
Write-Host "1️⃣  Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Git no está instalado" -ForegroundColor Red
    exit 1
}

# 2. Configurar usuario si se proporciona
if ($GitUser -and $GitEmail) {
    Write-Host "`n2️⃣  Configurando Git user..." -ForegroundColor Yellow
    git config user.name $GitUser
    git config user.email $GitEmail
    Write-Host "✅ Usuario configurado: $GitUser" -ForegroundColor Green
}

# 3. Ver estado
Write-Host "`n3️⃣  Estado del repositorio:" -ForegroundColor Yellow
git status

# 4. Preguntar si continuar
Write-Host "`n" -ForegroundColor Cyan
$continue = Read-Host "¿Deseas continuar? (S/N)"
if ($continue -ne "S" -and $continue -ne "s") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

# 5. Agregar archivos
Write-Host "`n4️⃣  Agregando archivos..." -ForegroundColor Yellow
git add .
Write-Host "✅ Archivos agregados" -ForegroundColor Green

# 6. Hacer commit
Write-Host "`n5️⃣  Haciendo commit..." -ForegroundColor Yellow
Write-Host "Mensaje: $Message" -ForegroundColor Gray
git commit -m $Message
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit creado" -ForegroundColor Green
} else {
    Write-Host "⚠️  No hay cambios para commitear" -ForegroundColor Yellow
}

# 7. Push
Write-Host "`n6️⃣  Subiendo a GitHub..." -ForegroundColor Yellow
git push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push exitoso" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error en push" -ForegroundColor Yellow
    Write-Host "Intenta: git push -u origin main" -ForegroundColor Gray
}

# 8. Mostrar resumen
Write-Host "`n" -ForegroundColor Cyan
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Último commit
$lastCommit = git log -1 --oneline
Write-Host "Último commit: $lastCommit" -ForegroundColor Green

# URL del repositorio
$remote = git remote get-url origin
Write-Host "Repositorio: $remote" -ForegroundColor Green

Write-Host "`n✨ ¡Listo! Tu código está en GitHub" -ForegroundColor Green
Write-Host "`n"
