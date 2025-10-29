# ✅ CHECKLIST ANTES DE COMENZAR

Cada vez que abras el proyecto, verifica esto:

## 🚀 Inicio de Sesión (2 minutos)

- [ ] Leer `PROJECT_INDEX.md` - Estado actual del proyecto
- [ ] Revisar `README_PROGRESO.md` - Qué está hecho/pendiente
- [ ] Abrir `.vscode/rules-config.json` - Reglas críticas
- [ ] Ejecutar: `npm install` (si es primera vez o .env cambió)

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

**Guardado automáticamente**: 2025-10-29T13:29:15.361Z
