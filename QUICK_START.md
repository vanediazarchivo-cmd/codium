# 🚀 GUÍA RÁPIDA DE INICIO - CODIUM

**Última actualización:** 29 de Noviembre de 2025

---

## 5 MINUTOS PARA LEVANTAR TODO

### Requisitos
- Docker Desktop instalado y ejecutándose
- Git
- (Opcional) Node.js 18+ si quieres correr localmente

### Paso 1: Clonar y Navegar
```bash
cd /workspaces/codium
```

### Paso 2: Levantar con Docker Compose
```bash
docker-compose up --build -d
```

Este comando levantará:
- ✅ PostgreSQL (datos)
- ✅ Redis (cola de jobs)
- ✅ API Backend (NestJS)
- ✅ Frontend (Next.js)
- ✅ Python Worker
- ✅ Java Worker
- ✅ Node Worker
- ✅ C++ Worker

**Espera 2-3 minutos para que todo esté listo...**

### Paso 3: Seed de Base de Datos
```bash
docker exec codium-api pnpm prisma:seed
```

Esto crea:
- 1 admin, 1 profesor, 3 estudiantes
- 2 cursos con estudiantes inscritos
- 4 retos de ejemplo
- 2 evaluaciones
- 2 submissions de prueba

### Paso 4: Acceder

**Frontend:** http://localhost:3001
**API Swagger:** http://localhost:3000/docs

### Paso 5: Loguearse

Usa cualquiera de estas credenciales:

```
ADMINISTRADOR:
  Email: admin@codium.com
  Password: admin123

PROFESOR:
  Email: professor@codium.com
  Password: professor123

ESTUDIANTE:
  Email: student1@codium.com
  Password: student123
  (también student2@codium.com y student3@codium.com)
```

---

## 🧪 PRUEBAS RÁPIDAS

### Test 1: Ver Cursos
1. Inicia sesión como estudiante
2. Ve a "Mis Cursos"
3. Deberías ver 2 cursos: "Backend" y "Algoritmos"

### Test 2: Ver Retos
1. Selecciona un curso
2. Ve a "Retos"
3. Deberías ver 2-4 retos según el curso

### Test 3: Enviar Solución
1. Abre un reto (ej: "Two Sum")
2. Escribe código Python:
```python
def solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```
3. Selecciona "PYTHON" como lenguaje
4. Haz click en "ENVIAR"
5. Espera a que se ejecute en el worker (2-5 segundos)
6. Deberías ver "ACCEPTED" ✅

### Test 4: Ver Evaluación Activa
1. Inicia sesión como profesor
2. Crea una evaluación o ve la existente
3. Asigna un reto
4. Publica la evaluación
5. Los estudiantes verán en "Evaluaciones Activas"

### Test 5: Leaderboard
1. Ve a "Leaderboard" en un curso
2. Deberías ver el ranking de estudiantes por score

---

## 📊 ARQUITECTURA

```
┌─────────────────────────────────────────┐
│         FRONTEND (Next.js)              │
│         Port: 3001                      │
│   http://localhost:3001                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         API (NestJS)                    │
│         Port: 3000                      │
│   http://localhost:3000/api             │
│   Swagger: http://localhost:3000/docs   │
└──┬────────────────────────────────┬─────┘
   │                                │
   ▼                                ▼
┌──────────────────┐          ┌──────────────────┐
│  PostgreSQL      │          │     Redis        │
│  Port: 5432      │          │  Port: 6379      │
└──────────────────┘          └──────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │   Worker     │      │   Worker     │      │   Worker     │
        │   Python     │      │    Java      │      │  Node.js     │
        └──────────────┘      └──────────────┘      └──────────────┘
                │
                ▼
        ┌──────────────┐
        │   Worker     │
        │    C++       │
        └──────────────┘
```

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### Ver logs en tiempo real
```bash
# Logs de API
docker logs codium-api -f

# Logs de Frontend
docker logs codium-frontend -f

# Logs de Worker Python
docker logs codium-python-worker -f
```

### Verificar que los servicios están corriendo
```bash
docker ps

# Deberías ver:
# - codium-api (NestJS)
# - codium-frontend (Next.js)
# - codium-postgres (PostgreSQL)
# - codium-redis (Redis)
# - codium-python-worker
# - codium-java-worker
# - codium-nodejs-worker
# - codium-cpp-worker
```

### Verificar conectividad a API
```bash
curl http://localhost:3000/docs

# Deberías ver la página de Swagger
```

---

## 🛑 DETENER TODO

```bash
# Detener los contenedores
docker-compose down

# (Opcional) Eliminar volúmenes (borra datos)
docker-compose down -v
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Connection refused" a PostgreSQL
```bash
# Solución: Reiniciar servicios
docker-compose restart postgres
docker-compose restart api
```

### Problema: Worker no procesa submissions
```bash
# Verificar Redis conectado
docker exec codium-redis redis-cli ping
# Deberías ver: PONG

# Ver jobs en Redis
docker exec codium-redis redis-cli
> KEYS *
> LLEN bull:submissions:0:wait
```

### Problema: Frontend no se conecta a API
```bash
# Verificar que API está corriendo
curl http://localhost:3000/api/auth/me

# Si falla, revisar logs
docker logs codium-api
```

### Problema: Base de datos vacía
```bash
# Re-ejecutar seed
docker exec codium-api pnpm prisma:seed

# O manualmente
docker-compose down -v
docker-compose up -d
docker exec codium-api pnpm prisma:seed
```

---

## 📱 API ENDPOINTS PRINCIPALES

### Autenticación
```bash
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
```

### Cursos
```bash
GET    /api/courses                              # Listar mis cursos
GET    /api/courses/:id                          # Detalle del curso
GET    /api/courses/:id/students                 # Estudiantes del curso (profesor)
POST   /api/courses                              # Crear curso (profesor)
POST   /api/courses/:id/students                 # Enrolear estudiante (profesor)
```

### Retos
```bash
GET    /api/challenges                           # Listar retos
GET    /api/challenges?courseId=X                # Retos de un curso
GET    /api/challenges/:id                       # Detalle del reto
POST   /api/challenges                           # Crear reto (profesor)
```

### Submissions
```bash
POST   /api/submissions                          # Enviar solución
GET    /api/submissions/my-submissions           # Mis envíos
GET    /api/submissions/:id                      # Detalle de envío
```

### Evaluaciones
```bash
GET    /api/evaluations                          # Todas las evaluaciones
GET    /api/evaluations/active                   # Solo evaluaciones activas
GET    /api/evaluations/:id                      # Detalle de evaluación
POST   /api/evaluations                          # Crear evaluación (profesor)
```

### Leaderboards
```bash
GET    /api/leaderboards/challenges/:id          # Ranking por reto
GET    /api/leaderboards/courses/:id             # Ranking por curso
GET    /api/leaderboards/evaluations/:id         # Ranking por evaluación
```

---

## 📖 DOCUMENTACIÓN COMPLETA

Para documentación detallada, ver:

- **AUDIT_REPORT.md** - Análisis exhaustivo de todo el proyecto
- **IMPLEMENTATION_SUMMARY.md** - Cambios específicos realizados
- **VALIDATION_REPORT.md** - Verificación y estado final
- **README.md** - Documentación general del proyecto

---

## 💡 TIPS

### Tip 1: Verificar estado de un submission
```bash
# En PostgreSQL
docker exec codium-postgres psql -U codium -d codium_db -c \
  "SELECT id, status, score, timeMsTotal FROM submissions ORDER BY createdAt DESC LIMIT 5;"
```

### Tip 2: Ver resultados de test cases
```bash
docker exec codium-postgres psql -U codium -d codium_db -c \
  "SELECT * FROM test_case_results ORDER BY createdAt DESC LIMIT 10;"
```

### Tip 3: Reiniciar solo el API sin perder datos
```bash
docker-compose restart api
```

### Tip 4: Ejecutar comandos dentro de contenedores
```bash
# Entrar a bash en el API
docker exec -it codium-api sh

# Ejecutar Prisma Studio (UI para BD)
docker exec -it codium-api pnpm prisma:studio
```

---

## ✅ VERIFICACIÓN FINAL

Cuando veas esto, todo está funcionando correctamente:

1. ✅ http://localhost:3001 - Frontend carga
2. ✅ http://localhost:3000/docs - Swagger documenta todos los endpoints
3. ✅ Puedo loguearme con credenciales de seed
4. ✅ Puedo ver cursos, retos, evaluaciones
5. ✅ Puedo enviar un submission y ver "ACCEPTED"
6. ✅ Los logs del worker muestran "Submission finalizado"

---

## 🎓 FLUJO DE EJEMPLO

### Como Estudiante:
1. Inicia sesión
2. Ve mis cursos
3. Selecciona un curso
4. Ve los retos disponibles
5. Abre un reto
6. Lee la descripción y casos de prueba
7. Escribe código en el editor
8. Selecciono lenguaje y envío
9. Espero resultado (2-5 segundos)
10. Ver "ACCEPTED" o error
11. Puedo reenviar múltiples veces

### Como Profesor:
1. Inicia sesión
2. Creo un nuevo reto
3. Agrego casos de prueba
4. Publico el reto
5. Creo una evaluación
6. Agrego retos a la evaluación
7. Publico la evaluación (establezco ventana de tiempo)
8. Veo las entregas de estudiantes
9. Veo leaderboard con calificaciones automáticas

---

¡Listo! El proyecto está completamente funcional. 🎉

Para más detalles técnicos, consulta los otros documentos en el repo.

