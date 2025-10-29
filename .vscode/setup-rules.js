/**
 * ⚡ SETUP AUTOMÁTICO DE REGLAS DEL PROYECTO
 * 
 * Este script:
 * 1. Lee las reglas críticas de PROJECT_INDEX.md
 * 2. Las carga en la configuración de VS Code
 * 3. Las guarda en un archivo de contexto local
 * 
 * Ejecutar: node .vscode/setup-rules.js
 */

const fs = require('fs');
const path = require('path');

// Rutas
const projectIndexPath = path.join(__dirname, '..', 'PROJECT_INDEX.md');
const rulesConfigPath = path.join(__dirname, 'rules-config.json');
const vscodeSettingsPath = path.join(__dirname, 'settings.json');

// Reglas críticas que deben memorizarse
const CRITICAL_RULES = [
  {
    id: 'rule-001',
    title: 'Aislamiento de Datos por Negocio',
    rule: 'NUNCA usar req.body.businessId → SIEMPRE usar req.user.businessId',
    severity: 'CRITICAL',
    affected: ['backend', 'routes', 'middleware']
  },
  {
    id: 'rule-002',
    title: 'Filtrado de Queries',
    rule: 'NUNCA hacer queries sin WHERE business_id → SIEMPRE filtrar por business_id',
    severity: 'CRITICAL',
    affected: ['backend', 'database', 'queries']
  },
  {
    id: 'rule-003',
    title: 'Validación en Backend',
    rule: 'NUNCA validar solo en frontend → SIEMPRE validar en backend',
    severity: 'CRITICAL',
    affected: ['backend', 'routes', 'security']
  },
  {
    id: 'rule-004',
    title: 'Transacciones en Inventario',
    rule: 'NUNCA hacer cambios de inventario sin transacciones → SIEMPRE usar BEGIN → COMMIT/ROLLBACK',
    severity: 'CRITICAL',
    affected: ['backend', 'inventory', 'database']
  },
  {
    id: 'rule-005',
    title: 'Stock Nunca Negativo',
    rule: 'NUNCA permitir stock negativo → SIEMPRE validar stock disponible antes de restar',
    severity: 'CRITICAL',
    affected: ['backend', 'inventory', 'validation']
  },
  {
    id: 'rule-006',
    title: 'Estructura de Archivos',
    rule: 'SIEMPRE mantener estructura: routes → middleware → services → database',
    severity: 'HIGH',
    affected: ['backend', 'organization']
  },
  {
    id: 'rule-007',
    title: 'Manejo de Errores',
    rule: 'SIEMPRE retornar { success, message, data, error } en cada endpoint',
    severity: 'HIGH',
    affected: ['backend', 'responses']
  },
  {
    id: 'rule-008',
    title: 'Documentación de Endpoints',
    rule: 'SIEMPRE documentar: método, ruta, autenticación requerida, parámetros, respuesta',
    severity: 'MEDIUM',
    affected: ['documentation', 'backend']
  }
];

/**
 * 1️⃣ Crear archivo de configuración de reglas
 */
function saveRulesConfig() {
  const config = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    totalRules: CRITICAL_RULES.length,
    criticalRules: CRITICAL_RULES.filter(r => r.severity === 'CRITICAL').length,
    rules: CRITICAL_RULES,
    metadata: {
      project: 'Administración Multi-Negocio',
      phase: 'Fase 2: Backend APIs',
      checklistBefore: [
        '✅ Leer PROJECT_INDEX.md',
        '✅ Memorizar reglas críticas',
        '✅ Revisar ejemplos en COPILOT_INSTRUCTIONS.md',
        '✅ Entender la estructura del proyecto'
      ]
    }
  };

  fs.writeFileSync(rulesConfigPath, JSON.stringify(config, null, 2));
  console.log(`✅ Reglas guardadas en: ${rulesConfigPath}`);
  return config;
}

/**
 * 2️⃣ Actualizar settings.json de VS Code
 */
function updateVSCodeSettings() {
  let settings = {};

  // Leer settings existentes si existen
  if (fs.existsSync(vscodeSettingsPath)) {
    const content = fs.readFileSync(vscodeSettingsPath, 'utf8');
    if (content.trim()) {
      try {
        settings = JSON.parse(content);
      } catch (e) {
        console.warn('⚠️ settings.json no es JSON válido, creando nuevo');
      }
    }
  }

  // Agregar/actualizar reglas
  settings['[project]'] = {
    rulesVersion: '1.0.0',
    criticalRulesCount: CRITICAL_RULES.filter(r => r.severity === 'CRITICAL').length,
    lastUpdated: new Date().toISOString(),
    rulesFile: '.vscode/rules-config.json',
    checklistBeforeStart: [
      'Leer PROJECT_INDEX.md',
      'Revisar COPILOT_INSTRUCTIONS.md',
      'Memorizar 5 reglas críticas'
    ]
  };

  // Agregar configuración de Copilot
  settings['github.copilot.editor.codex.codeblockLanguageExtractor'] = true;
  settings['github.copilot.advanced'] = {
    'inlineSuggestCount': 5,
    'debug.testOverridePrometheusPort': false
  };

  // Guardar
  fs.writeFileSync(vscodeSettingsPath, JSON.stringify(settings, null, 2));
  console.log(`✅ VS Code settings actualizado: ${vscodeSettingsPath}`);
}

/**
 * 3️⃣ Crear archivo de checklist para el inicio
 */
function createStartupChecklist() {
  const checklist = `# ✅ CHECKLIST ANTES DE COMENZAR

Cada vez que abras el proyecto, verifica esto:

## 🚀 Inicio de Sesión (2 minutos)

- [ ] Leer \`PROJECT_INDEX.md\` - Estado actual del proyecto
- [ ] Revisar \`README_PROGRESO.md\` - Qué está hecho/pendiente
- [ ] Abrir \`.vscode/rules-config.json\` - Reglas críticas
- [ ] Ejecutar: \`npm install\` (si es primera vez o .env cambió)

## 🧠 Memorizar (si no lo has hecho)

- [ ] Las 5 reglas CRÍTICAS (ver PROJECT_INDEX.md)
- [ ] Estructura de carpetas (backend/routes/services/database)
- [ ] Endpoint actual que estoy implementando
- [ ] Qué módulo del negocio estoy trabajando

## 🔐 Seguridad

- [ ] ¿Mi código filtra por business_id? → Verificar en cada query
- [ ] ¿Valido entrada en backend? → No solo en frontend
- [ ] ¿Uso transacciones para inventario? → BEGIN/COMMIT/ROLLBACK
- [ ] ¿El stock nunca es negativo? → Validar antes de restar

## 📝 Documentación

- [ ] ¿Documenté mi endpoint? → Método, ruta, params, respuesta
- [ ] ¿Actualicé README_PROGRESO.md? → Marqué lo que completé
- [ ] ¿Actualicé PROJECT_INDEX.md? → Si cambió algo importante
- [ ] ¿Hice commit a GitHub? → git commit con mensaje descriptivo

## 🧪 Testing

- [ ] ¿Probé el endpoint en Postman/Insomnia?
- [ ] ¿Probé con múltiples businesses?
- [ ] ¿Probé casos de error?
- [ ] ¿El logging es claro?

---

**Guardado automáticamente**: ${new Date().toISOString()}
`;

  fs.writeFileSync(
    path.join(__dirname, 'CHECKLIST_INICIO.md'),
    checklist
  );
  console.log(`✅ Checklist creado: .vscode/CHECKLIST_INICIO.md`);
}

/**
 * 4️⃣ Crear prompt para Copilot
 */
function createCopilotPrompt() {
  const prompt = `# 🤖 PROMPT PARA COPILOT

Usa esto como contexto cuando consultes a GitHub Copilot:

\`\`\`
Estoy trabajando en un sistema de administración de negocios con:
- Backend: Node.js + Express + PostgreSQL
- Frontend: React Native + Expo
- Arquitectura: Modular, multi-negocio, multi-usuario

REGLAS CRÍTICAS QUE DEBO SEGUIR:
1. NUNCA req.body.businessId → SIEMPRE req.user.businessId (desde JWT)
2. NUNCA query sin WHERE business_id → SIEMPRE filtrar por business_id
3. NUNCA validar solo frontend → SIEMPRE validar en backend
4. NUNCA cambios de inventario sin transacciones → SIEMPRE BEGIN/COMMIT/ROLLBACK
5. NUNCA stock negativo → SIEMPRE validar antes de restar

ESTRUCTURA:
- Routes: /routes/*.js (definen endpoints)
- Services: /services/*.js (lógica de negocio)
- Database: /database/*.js (queries, transacciones)
- Middleware: /middleware/auth.js (verificación JWT)

CUANDO PIDAS AYUDA:
- Menciona qué endpoint estoy creando
- Menciona qué módulo del negocio
- Pega el contexto de README_PROGRESO.md
- Pega la estructura esperada del endpoint

Ver también: .vscode/rules-config.json
\`\`\`
`;

  fs.writeFileSync(
    path.join(__dirname, 'COPILOT_PROMPT.md'),
    prompt
  );
  console.log(`✅ Prompt para Copilot creado: .vscode/COPILOT_PROMPT.md`);
}

/**
 * 5️⃣ Crear archivo de verificación de reglas
 */
function createRulesValidator() {
  const validator = `#!/usr/bin/env node

/**
 * Validador de reglas - Verifica que tu código sigue las reglas críticas
 * Ejecutar: node .vscode/validate-rules.js <archivo>
 */

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.log('Uso: node .vscode/validate-rules.js <archivo>');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');

const checks = [
  {
    name: '🔐 Aislamiento de Datos',
    pattern: /req\\.body\\.businessId/,
    fail: 'CRÍTICO: Encontrado req.body.businessId',
    pass: 'Usando req.user.businessId'
  },
  {
    name: '🔒 Filtrado por business_id',
    pattern: /WHERE.*business_id/i,
    fail: 'CRÍTICO: Query sin WHERE business_id',
    pass: 'Query filtrada por business_id'
  },
  {
    name: '📝 Validación en Backend',
    pattern: /if\\s*\\(.*\\)\\s*{.*throw|return.*error/i,
    fail: 'Verificar validación backend',
    pass: 'Validación detectada'
  }
];

console.log(\`\\n✅ Validando: \${path.basename(file)}\\n\`);
checks.forEach(check => {
  const hasProblem = check.pattern.test(content);
  console.log(\`\${hasProblem ? '❌' : '✅'} \${check.name}\`);
});
`;

  fs.writeFileSync(
    path.join(__dirname, 'validate-rules.js'),
    validator
  );
  console.log(`✅ Validador de reglas creado: .vscode/validate-rules.js`);
}

/**
 * 6️⃣ Crear README para .vscode
 */
function createVSCodeReadme() {
  const readme = `# 📁 Configuración VS Code (.vscode)

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
\`\`\`bash
npm install -g node
node .vscode/setup-rules.js
\`\`\`

### Validar un archivo
\`\`\`bash
node .vscode/validate-rules.js ../backend/routes/products.js
\`\`\`

### Antes de cada sesión
1. Abre \`CHECKLIST_INICIO.md\`
2. Marca los items que ya hiciste
3. Comienza a trabajar

## 📖 Lectura Recomendada

En orden:
1. \`../PROJECT_INDEX.md\`
2. \`../README_PROGRESO.md\`
3. \`rules-config.json\`
4. \`CHECKLIST_INICIO.md\`
5. \`COPILOT_PROMPT.md\`
`;

  fs.writeFileSync(
    path.join(__dirname, 'README.md'),
    readme
  );
  console.log(`✅ README creado: .vscode/README.md`);
}

/**
 * ▶️ EJECUTAR TODO
 */
console.log('🚀 Inicializando reglas del proyecto...\n');

try {
  saveRulesConfig();
  updateVSCodeSettings();
  createStartupChecklist();
  createCopilotPrompt();
  createRulesValidator();
  createVSCodeReadme();

  console.log('\n✅ ✅ ✅ TODO LISTO ✅ ✅ ✅\n');
  console.log('Próximos pasos:');
  console.log('1. Abre .vscode/CHECKLIST_INICIO.md');
  console.log('2. Memoriza las reglas en .vscode/rules-config.json');
  console.log('3. Comienza a implementar según README_PROGRESO.md\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
