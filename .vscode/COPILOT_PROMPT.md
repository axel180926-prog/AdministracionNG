# 🤖 PROMPT PARA COPILOT

Usa esto como contexto cuando consultes a GitHub Copilot:

```
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
```
