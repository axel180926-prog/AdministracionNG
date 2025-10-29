# 📁 Configuración VS Code (.vscode)

Este directorio contiene la configuración automática del proyecto.

## Archivos Importantes

### 🔧 Configuración
- **settings.json** - Configuración global de VS Code
- **extensions.json** - Extensiones recomendadas

### 📋 Reglas y Checklists
- **rules-config.json** ← Generado automáticamente
- **CHECKLIST_INICIO.md** - Checklist antes de empezar
- **COPILOT_PROMPT.md** - Prompt para usar con Copilot

### 🛠️ Scripts
- **setup-rules.js** - Genera la configuración (ejecutar: node setup-rules.js)
- **validate-rules.js** - Valida que el código siga reglas

## 🚀 Cómo Usar

### Primera vez
```bash
npm install -g node
node .vscode/setup-rules.js
```

### Validar un archivo
```bash
node .vscode/validate-rules.js ../backend/routes/products.js
```

### Antes de cada sesión
1. Abre `CHECKLIST_INICIO.md`
2. Marca los items que ya hiciste
3. Comienza a trabajar

## 📖 Lectura Recomendada

En orden:
1. `../PROJECT_INDEX.md`
2. `../README_PROGRESO.md`
3. `rules-config.json`
4. `CHECKLIST_INICIO.md`
5. `COPILOT_PROMPT.md`
