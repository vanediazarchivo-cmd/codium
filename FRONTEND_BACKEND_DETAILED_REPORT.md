# Análisis Frontend-Backend: Codium

**Fecha:** 29 de Noviembre, 2025  
**Estado:** ⚠️ DESALINEACIONES CRÍTICAS ENCONTRADAS

## 📊 Resumen Ejecutivo

| Métrica | Resultado |
|---------|-----------|
| **Páginas Frontales Encontradas** | 24 |
| **Componentes Encontrados** | 10 + UI Library |
| **Hooks Encontrados** | 3 |
| **Endpoints del Backend** | 41 totales |
| **Endpoints Implementados** | 38/41 (92.7%) |
| **Endpoints Faltantes** | 2 |
| **Páginas Dinámicas Faltantes** | 8 |
| **Problemas Críticos** | 🔴 1 |
| **Problemas Altos** | 🟠 3 |
| **Problemas Medios** | 🟡 4 |

---

## 🔴 PROBLEMAS CRÍTICOS (Bloquean Funcionalidad)

### 1. `submissionsApi.listUserSubmissions()` NO DEFINIDO
**Severidad:** CRÍTICA | **Estado:** 🔴 BLOQUEANTE

**Ubicación Problema:**
- Frontend: `/frontend/app/dashboard/page.tsx` línea 31
- Error: `apiClient.submissionsApi.listUserSubmissions()` se llama pero NO existe

**Lo que Sucede:**
```tsx
// Dashboard intenta llamar
const submissions = await apiClient.submissionsApi.listUserSubmissions()
// Pero en api-client.ts solo existe:
submissionsApi = {
  list: () => ApiClient.get("/submissions/my-submissions"),  // ← Este es el nombre
  get: (id: string) => ...,
  submit: (data: any) => ...
}
```

**Impacto:**
- ❌ Dashboard CRASHEA al cargar estadísticas
- ❌ TypeError: `submissionsApi.listUserSubmissions is not a function`
- ❌ Usuario ve página rota

**Solución:**
Opción A (Recomendada):
```typescript
// En /frontend/lib/api-client.ts, renombrar o añadir alias
submissionsApi = {
  list: () => ApiClient.get("/submissions/my-submissions"),
  listUserSubmissions: () => ApiClient.get("/submissions/my-submissions"), // ← Nuevo alias
  get: (id: string) => ...,
  submit: (data: any) => ...
}
```

Opción B:
Cambiar dashboard a usar `submissionsApi.list()` en lugar de `listUserSubmissions()`

---

## 🟠 PROBLEMAS ALTOS (Afectan Funcionalidad Principal)

### 2. Endpoints PATCH/DELETE para Cursos NO Implementados
**Severidad:** ALTA | **Estado:** 🟠 FALTA EN BACKEND

**Endpoints Faltantes:**
- ❌ `PATCH /courses/:id` - Actualizar curso
- ❌ `DELETE /courses/:id` - Eliminar curso

**Frontend Expectativas:**
```typescript
coursesApi = {
  update: (id: string, data: any) => ApiClient.patch(`/courses/${id}`, data),  // ✓ Definido
  delete: (id: string) => ApiClient.delete(`/courses/${id}`),  // ✓ Definido
}
```

**Backend Realidad:**
```typescript
// /src/interface/http/courses/courses.controller.ts solo tiene:
@Post()              // ✓ Crear
@Get()               // ✓ Listar
@Get(':id')          // ✓ Obtener uno
@Get(':id/students') // ✓ Listar estudiantes
@Post(":id/students")          // ✓ Inscribir
@Post(":id/students/:studentId/unenroll")  // ✓ Desinscribir
// FALTA: @Patch(':id'), @Delete(':id')
```

**Ubicación Referencia Frontend:**
- `/frontend/app/dashboard/courses/page.tsx` - líneas 59-77 (handleUpdate, handleDelete)

**Impacto:**
- ❌ Profesores NO pueden editar cursos existentes
- ❌ Profesores NO pueden eliminar cursos
- ❌ Botones "Actualizar" y "Eliminar" en UI no funcionan
- ⚠️ Datos guardados localmente, NO se sincroniza con backend

**Solución:**
Implementar en backend:
```typescript
@Patch(':id')
@Roles(UserRole.PROFESSOR)
async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
  return this.updateCourseUseCase.execute(id, dto, user.id, user.role);
}

@Delete(':id')
@Roles(UserRole.PROFESSOR)
async delete(@Param('id') id: string, @CurrentUser() user: any) {
  return this.deleteCourseUseCase.execute(id, user.id, user.role);
}
```

---

### 3. Componentes Usan Mock Data en Lugar de APIs Reales
**Severidad:** ALTA | **Estado:** 🟠 IMPLEMENTACIÓN INCOMPLETA

**Componentes Afectados:**
1. `/frontend/components/challenge-submissions.tsx` - Usa hardcoded mock data
2. `/frontend/components/challenge-test-cases.tsx` - Estado local, NO llamadas API
3. `/frontend/components/group-challenges.tsx` - Estado local, NO llamadas API
4. `/frontend/components/group-evaluations.tsx` - Estado local, NO llamadas API
5. `/frontend/app/dashboard/challenges/page.tsx` - Hardcoded mock data
6. `/frontend/app/dashboard/evaluations/page.tsx` - Hardcoded mock data

**Ejemplo - Submissions con Mock Data:**
```tsx
// ❌ ACTUAL (Mock data hardcoded)
const [submissions] = useState<Submission[]>([
  {
    id: "1",
    studentName: "Juan Pérez",
    language: "Python",
    status: "ACCEPTED",
    // ... más datos fake ...
  },
  // ... más mocks ...
])

// ✓ DEBERÍA SER
const [submissions, setSubmissions] = useState<Submission[]>([])

useEffect(() => {
  // Cargar datos reales del backend
  const loadSubmissions = async () => {
    try {
      const data = await apiClient.submissionsApi.list()
      setSubmissions(data)
    } catch (err) {
      console.error("Error cargando submissions:", err)
    }
  }
  loadSubmissions()
}, [])
```

**Impacto:**
- ❌ Usuarios ven datos FALSOS, no reales
- ❌ Cambios en UI NO se guardan en backend
- ❌ Datos inconsistentes entre sesiones
- ❌ Imposible probar funcionalidad real

**Solución:**
Reemplazar todos los `useState` con datos mock por llamadas reales a API usando `useEffect`

---

### 4. Páginas Dinámicas Faltantes (Rutas 404)
**Severidad:** ALTA | **Estado:** 🟠 FALTA EN FRONTEND

**Páginas No Creadas:**
1. `/frontend/app/dashboard/courses/create/page.tsx` - Crear nuevo curso
2. `/frontend/app/dashboard/challenges/[id]/page.tsx` - Ver detalles del reto
3. `/frontend/app/dashboard/evaluations/create/page.tsx` - Crear evaluación
4. `/frontend/app/dashboard/evaluations/[id]/page.tsx` - Ver detalles evaluación
5. `/frontend/app/dashboard/evaluations/[id]/edit/page.tsx` - Editar evaluación
6. `/frontend/app/student/courses/[id]/page.tsx` - Estudiante ver curso
7. `/frontend/app/student/challenges/page.tsx` - Estudiante retos del curso
8. `/frontend/app/student/evaluations/page.tsx` - Estudiante sus evaluaciones

**Rutas Referencias en Frontend:**
- `<Link href="/dashboard/challenges/create">` en `/frontend/app/dashboard/challenges/page.tsx`
- `<Link href="/dashboard/evaluations/create">` en `/frontend/app/dashboard/evaluations/page.tsx`
- `<Link href={`/dashboard/evaluations/${evaluation.id}`}>` en evaluations page
- `<Link href={`/student/courses/${course.id}`}>` en `/frontend/app/student/page.tsx`

**Impacto:**
- ❌ Navegar a detalles = Error 404
- ❌ Crear nuevos items = Error 404
- ❌ Editar items = Error 404
- ❌ Flujos incompletos

**Solución:**
Crear todos los archivos faltantes con componentes adecuados

---

## 🟡 PROBLEMAS MEDIOS

### 5. Mismatch en Login Response
**Severidad:** MEDIA | **Ubicación:** `/frontend/app/login/page.tsx` línea 32

```tsx
const response = await apiClient.authApi.login({ email, password })
if (response.access_token) {  // ← Se asume que respuesta tiene "access_token"
  localStorage.setItem("auth_token", response.access_token)
}
```

**Verificación Necesaria:** Confirmar que `LoginUseCase` en backend retorna exactamente `{ access_token: '...' }`

---

### 6. Validación de Roles
**Severidad:** MEDIA | **Ubicación:** `/frontend/app/register/page.tsx`

Frontend envía roles: `"STUDENT"` o `"PROFESSOR"`

**Verificación Necesaria:** Confirmar que backend `RegisterDto` y `UserRole` enum coinciden exactamente

---

### 7. Query Parameters en Challenges
**Severidad:** MEDIA | **Ubicación:** `/frontend/lib/api-client.ts`

```typescript
challengesApi = {
  list: (groupId?: string) => {
    const query = groupId ? `?groupId=${groupId}` : ""
    return ApiClient.get(`/challenges${query}`)
  }
}
```

Backend soporta el parámetro pero es importante verificar consistencia

---

### 8. DTO Fields Mismatch en Register
**Severidad:** MEDIA | **Ubicación:** `/frontend/app/register/page.tsx`

Frontend envía:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "STUDENT|PROFESSOR"
}
```

**Verificación Necesaria:** Confirmar que `RegisterDto` en backend espera exactamente estos campos

---

## ✅ LO QUE SÍ FUNCIONA

### Endpoints Implementados Correctamente (38/41):

**✓ Auth (3/3)**
- POST /auth/login
- POST /auth/register
- GET /auth/me

**✓ Courses (5/7)**
- POST /courses - Crear
- GET /courses - Listar
- GET /courses/:id - Obtener
- GET /courses/:id/students - Listar estudiantes
- POST /courses/:id/students - Inscribir estudiante
- POST /courses/:id/students/:studentId/unenroll - Desinscribir
- ❌ PATCH /courses/:id - FALTA
- ❌ DELETE /courses/:id - FALTA

**✓ Challenges (5/5)**
- POST /challenges
- GET /challenges
- GET /challenges/:id
- PATCH /challenges/:id
- DELETE /challenges/:id

**✓ Test Cases (3/3)**
- POST /challenges/:challengeId/test-cases
- GET /challenges/:challengeId/test-cases
- DELETE /challenges/:challengeId/test-cases/:testCaseId

**✓ Submissions (3/3)**
- POST /submissions
- GET /submissions/my-submissions
- GET /submissions/:id

**✓ Evaluations (7/7)**
- POST /evaluations
- GET /evaluations
- GET /evaluations/active
- GET /evaluations/:id
- PATCH /evaluations/:id
- DELETE /evaluations/:id
- POST /evaluations/:id/challenges
- DELETE /evaluations/:id/challenges/:challengeId

**✓ Leaderboards (3/3)**
- GET /leaderboards/challenges/:challengeId
- GET /leaderboards/courses/:courseId
- GET /leaderboards/evaluations/:evaluationId

**✓ Users (2/2)**
- GET /users
- GET /users/:id

**✓ Groups (7/7)**
- POST /groups
- GET /groups
- GET /groups/:id
- GET /groups/course/:courseId/number/:number
- PATCH /groups/:id
- DELETE /groups/:id
- POST /groups/:id/students

---

## 📋 Plan de Acción Prioritario

### 🔴 URGENTE (Hace el sistema no funcional):
1. **HOYYYY:** Agregar `listUserSubmissions()` método a `submissionsApi` en api-client.ts
2. **HOY:** Verificar que LoginUseCase devuelve `{ access_token: '...' }`

### 🟠 IMPORTANTE (Próximas 24-48 horas):
3. Implementar PATCH y DELETE para /courses en backend
4. Reemplazar TODOS los useState con mock data por llamadas API reales
5. Crear las 8 páginas dinámicas faltantes
6. Verificar DTO fields coinciden exactamente

### 🟡 SECUNDARIO (Esta semana):
7. Validar roles enum STUDENT/PROFESSOR
8. Ajustar query parameters consistency
9. Pruebas end-to-end de flujos críticos

---

## 🧪 Checklist de Validación

- [ ] ¿`submissionsApi.listUserSubmissions()` definido en api-client.ts?
- [ ] ¿Dashboard carga sin errores?
- [ ] ¿Puede crear curso? (POST /courses)
- [ ] ¿Puede editar curso? (PATCH /courses/:id) - FALTA
- [ ] ¿Puede eliminar curso? (DELETE /courses/:id) - FALTA
- [ ] ¿Challenge submissions cargan datos reales?
- [ ] ¿Navegación a `/dashboard/challenges/1` funciona?
- [ ] ¿Navegación a `/student/courses/1` funciona?
- [ ] ¿Login devuelve access_token correcto?
- [ ] ¿Roles Register coinciden con backend?

---

**Generado:** 29 Nov 2025 | **Por:** Análisis Automático Frontend-Backend
