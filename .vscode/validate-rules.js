#!/usr/bin/env node

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
    pattern: /req\.body\.businessId/,
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
    pattern: /if\s*\(.*\)\s*{.*throw|return.*error/i,
    fail: 'Verificar validación backend',
    pass: 'Validación detectada'
  }
];

console.log(`\n✅ Validando: ${path.basename(file)}\n`);
checks.forEach(check => {
  const hasProblem = check.pattern.test(content);
  console.log(`${hasProblem ? '❌' : '✅'} ${check.name}`);
});
