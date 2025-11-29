# 🔧 INSTRUCCIONES TÉCNICAS PARA CORREGIR PROBLEMAS CRÍTICOS

## 1. 🔴 CRÍTICO: Agregar Modelo Group a Schema.prisma

**Archivo:** `prisma/schema.prisma`

**Situación Actual:**
- `GroupsController` referencia `prisma.group` (línea 20)
- Pero el modelo NO existe en schema
- Causa: `RuntimeError: Model "Group" is not defined`

**Solución:**

Agregar ANTES del modelo `User`:

```prisma
model Group {
  id        String   @id @default(uuid())
  name      String
  courseId  String
  number    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  students  User[] @relation("GroupStudents")

  @@unique([courseId, number])
  @@map("groups")
}
```

**Cambios en User model:**
```prisma
model User {
  // ... existing fields ...
  
  // Agregar esta línea:
  groups    Group[] @relation("GroupStudents")
}
```

**Cambios en Course model:**
```prisma
model Course {
  // ... existing fields ...
  
  // Agregar esta línea:
  groups    Group[]
}
```

**Comandos a ejecutar:**
```bash
cd /workspaces/codium
npx prisma migrate dev --name add_group_model
npx prisma generate
```

---

## 2. 🔴 CRÍTICO: Corregir Desalineación de Login

**Situación Actual:**
- Backend retorna `accessToken` (LoginResponse.accessToken)
- Frontend espera `access_token` (apiClient.ts línea 28)
- Resultado: Login nunca guarda token

**Solución A: Cambiar Backend (RECOMENDADO)**

**Archivo:** `src/core/application/auth/usecases/login.usecase.ts`

```typescript
// Cambiar:
return {
  access_token: token,  // ❌ MALO
  user: userDto,
}

// Por:
return {
  accessToken: token,   // ✅ BUENO
  user: userDto,
}
```

**Archivo:** `src/core/application/auth/dto/login.dto.ts`

```typescript
export interface LoginResponse {
  accessToken: string;  // ✅ Cambiar de access_token
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}
```

**Solución B: Cambiar Frontend (ALTERNATIVA)**

**Archivo:** `frontend/lib/api-client.ts`

```typescript
// Línea 28, cambiar:
const response = await apiClient.authApi.login({
  email,
  password,
})

if (response.access_token) {        // ❌ MALO
  localStorage.setItem("auth_token", response.access_token)
}

// Por:
const response = await apiClient.authApi.login({
  email,
  password,
})

if (response.accessToken) {         // ✅ BUENO
  localStorage.setItem("auth_token", response.accessToken)
}
```

---

## 3. 🔴 CRÍTICO: Resolver Redundancia de Submissions

**Situación Actual:**
```
SubmissionQueue (Redis)
    ↓
Consumida por 3 procesos simultáneamente:
    ├─ RunnerService (src/infrastructure/runners/runner.service.ts)
    ├─ SubmissionProcessor (src/infrastructure/queue/submission.processor.ts)
    └─ 4 Workers externos (workers/*/worker.ts)
```

**Recomendación: Arquitectura de Workers Solo**

### Paso 1: Eliminar RunnerService del Flujo Principal

**Archivo:** `src/core/application/submissions/usecases/submit-solution.usecase.ts`

El archivo ACTUALMENTE hace esto:

```typescript
// ❌ ESTA LÍNEA ES PROBLEMÁTICA:
// Usa SubmissionProcessor que también corre en el API
// Y workers externos también compiten
```

### Paso 2: Decisión de Arquitectura

**OPCIÓN RECOMENDADA: Solo Workers Externos**

1. **Eliminar:** `src/infrastructure/queue/submission.processor.ts`
   ```bash
   rm src/infrastructure/queue/submission.processor.ts
   ```

2. **Eliminar:** `src/infrastructure/runners/runner.service.ts`
   ```bash
   rm src/infrastructure/runners/runner.service.ts
   ```

3. **Mantener:** Workers externos (`workers/*/worker.ts`)

4. **Modificar:** `submit-solution.usecase.ts` para SOLO encolar
   ```typescript
   // Solo encolar, no procesar en el API
   await this.submissionQueue.add(
     'process-submission',
     {
       submissionId: saved.id,
       userId,
       challengeId: saved.challengeId,
       code: saved.code,
       language: saved.language,
       testCases: testCases.map(tc => ({...})),
     },
     {
       attempts: 3,
       backoff: { type: 'exponential', delay: 2000 },
       removeOnComplete: true,
     },
   );
   ```

5. **Actualizar:** `submissions.module.ts`
   ```typescript
   @Module({
     imports: [
       BullModule.registerQueue({ name: "submissions" }),
       ChallengesModule,
       UsersModule,
       TestCasesModule,
     ],
     controllers: [SubmissionsController],
     providers: [
       SubmitSolutionUseCase,
       GetSubmissionUseCase,
       ListUserSubmissionsUseCase,
       // ❌ Eliminar: SubmissionProcessor,
       // ❌ Eliminar: RunnerService,
       PrismaService,
       {
         provide: SUBMISSION_REPOSITORY,
         useClass: SubmissionPrismaRepository,
       },
       {
         provide: TEST_CASE_REPOSITORY,
         useClass: TestCasePrismaRepository,
       },
     ],
   })
   export class SubmissionsModule {}
   ```

---

## 4. 🔴 CRÍTICO: Implementar Java Worker

**Archivo:** `workers/java-worker/worker.ts`

**Reemplazar contenido con:**

```typescript
import Bull, { Job } from "bull";
import { PrismaClient } from "@prisma/client";
import Docker from "dockerode";

const prisma = new PrismaClient();
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number.parseInt(process.env.REDIS_PORT || "6379");

const submissionQueue = new Bull("submissions", {
  redis: { host: REDIS_HOST, port: REDIS_PORT },
});

console.log(`[Java Worker] Conectado a Redis en ${REDIS_HOST}:${REDIS_PORT}`);
console.log("[Java Worker] Esperando trabajos...");

interface SubmissionJobData {
  submissionId: string;
  userId?: string;
  challengeId?: string;
  code?: string;
  language?: string;
  testCases?: Array<{ testCaseId: string; input: string; expectedOutput: string }>;
}

async function executeContainer(params: {
  image: string;
  cmd: string[];
  code?: string;
  input: string;
  limits: { timeout: number; memory: number; cpus: number };
  fileName?: string;
  skipWrite?: boolean;
}): Promise<{ output: string; error?: string; timeMs: number; exitCode: number }> {
  const startTime = Date.now();
  let container: any;

  try {
    container = await docker.createContainer({
      Image: params.image,
      Cmd: params.cmd,
      OpenStdin: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      StdinOnce: false,
      HostConfig: {
        NetworkMode: "none",
        Memory: params.limits.memory * 1024 * 1024,
        MemorySwap: params.limits.memory * 1024 * 1024,
        CpuQuota: Math.floor(params.limits.cpus * 100000),
        PidsLimit: 10,
        ReadonlyRootfs: false,
        CapDrop: ["ALL"],
        SecurityOpt: ["no-new-privileges:true"],
      },
    });

    if (params.code && !params.skipWrite && params.fileName) {
      const tarBuffer = createTarBuffer(params.fileName, params.code);
      try {
        await container.putArchive(tarBuffer, { path: "/tmp" });
      } catch (e: any) {
        console.warn("Could not write file into container:", e.message);
      }
    }

    await container.start();

    const stream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    stream.on("data", (chunk: Buffer) => {
      if (chunk.length > 8) {
        const streamType = chunk[0];
        const data = chunk.slice(8);
        if (streamType === 1) stdoutChunks.push(data);
        if (streamType === 2) stderrChunks.push(data);
      }
    });

    stream.write(params.input || "");
    stream.end();

    const output = await Promise.race([
      new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        stream.on("end", () => {
          resolve({ stdout: Buffer.concat(stdoutChunks).toString(), stderr: Buffer.concat(stderrChunks).toString() });
        });
        stream.on("error", reject);
      }),
      new Promise<{ stdout: string; stderr: string }>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), params.limits.timeout),
      ),
    ]);

    const timeMs = Date.now() - startTime;

    const exitData = await container.wait();
    const exitCode = exitData.StatusCode || 0;

    return { output: output.stdout, error: output.stderr || undefined, timeMs, exitCode };
  } catch (error: any) {
    const timeMs = Date.now() - startTime;
    if (error.message === "TIMEOUT") {
      return { output: "", error: "TIME_LIMIT_EXCEEDED", timeMs, exitCode: -1 };
    }
    return { output: "", error: `RUNTIME_ERROR: ${error.message}`, timeMs, exitCode: 1 };
  } finally {
    if (container) {
      try {
        await container.remove({ force: true });
      } catch (e: any) {
        console.warn("Failed to remove container:", e.message);
      }
    }
  }
}

function createTarBuffer(fileName: string, content: string): Buffer {
  const fileContent = Buffer.from(content);
  const fileNameBytes = Buffer.from(fileName);
  const header = Buffer.alloc(512);
  fileNameBytes.copy(header, 0);
  header.write('0000644\0', 100);
  header.write('0000000\0', 108);
  header.write('0000000\0', 116);
  header.write((fileContent.length).toString(8).padStart(11, '0') + '\0', 124);
  header.write(Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0', 136);
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    if (i >= 148 && i < 156) checksum += 32;
    else checksum += header[i];
  }
  header.write(checksum.toString(8).padStart(6, '0') + '\0', 148);
  const padding = Buffer.alloc((512 - (fileContent.length % 512)) % 512);
  const endOfArchive = Buffer.alloc(1024);
  return Buffer.concat([header, fileContent, padding, endOfArchive]);
}

function compareOutput(actual: string, expected: string): string {
  if (actual == null) actual = '';
  if (expected == null) expected = '';
  const actualTrimmed = actual.trim();
  const expectedTrimmed = expected.trim();

  if (actualTrimmed === expectedTrimmed) return 'ACCEPTED';

  const actualLines = actualTrimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const expectedLines = expectedTrimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (actualLines.length === expectedLines.length && actualLines.every((ln, i) => ln === expectedLines[i])) return 'ACCEPTED';

  const actualNum = parseFloat(actualTrimmed);
  const expectedNum = parseFloat(expectedTrimmed);
  if (!isNaN(actualNum) && !isNaN(expectedNum) && actualNum === expectedNum) return 'ACCEPTED';

  return 'WRONG_ANSWER';
}

submissionQueue.process('process-submission', async (job: Job<SubmissionJobData>) => {
  const data = job.data;
  const submissionId = data.submissionId;
  const language = (data.language || '').toString().toUpperCase();

  if (!submissionId) throw new Error('No submissionId in job');
  if (!['JAVA'].includes(language)) {
    console.log(`[Java Worker] Ignorando submission ${submissionId} (language=${language})`);
    return;
  }

  console.log(`[Java Worker] Procesando submission ${submissionId}`);
  try {
    await prisma.submission.update({ where: { id: submissionId }, data: { status: 'RUNNING' } as any });
  } catch (e: any) { console.warn('Could not mark RUNNING:', e.message); }

  const testCases = data.testCases || [];
  let passedCount = 0; let totalTime = 0; const results: any[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      // Asegurar que la clase se llame "Solution"
      let javaCode = data.code || '';
      if (!javaCode.includes('public class Solution')) {
        javaCode = javaCode.replace(/public class \w+/, 'public class Solution');
      }

      // Paso 1: Compilar
      const compileResult = await executeContainer({
        image: 'openjdk:21-slim',
        cmd: ['bash', '-c', 'cd /tmp && javac Solution.java'],
        code: javaCode,
        input: '',
        limits: { timeout: 10000, memory: 256, cpus: 1 },
        fileName: 'Solution.java',
      });

      if (compileResult.exitCode !== 0) {
        throw new Error(`Compilation error: ${compileResult.error || compileResult.output}`);
      }

      // Paso 2: Ejecutar
      const run = await executeContainer({
        image: 'openjdk:21-slim',
        cmd: ['bash', '-c', 'cd /tmp && java Solution'],
        code: '',
        input: tc.input || '',
        limits: { timeout: 5000, memory: 256, cpus: 1 },
        fileName: 'Solution.class',
        skipWrite: true,
      });

      const status = compareOutput(run.output, tc.expectedOutput);
      results.push({
        submissionId,
        testCaseId: tc.testCaseId,
        status: status === 'ACCEPTED' ? 'ACCEPTED' : 'WRONG_ANSWER',
        timeMs: run.timeMs,
        memoryMb: 0,
        output: run.output,
        error: run.error || null,
      });

      if (status === 'ACCEPTED') passedCount++;
      totalTime += run.timeMs;
      console.log(`[Java Worker] TC ${i + 1}/${testCases.length}: ${status} (${run.timeMs}ms)`);
    } catch (err: any) {
      console.error('[Java Worker] Error en TC:', err.message);
      results.push({
        submissionId,
        testCaseId: tc.testCaseId,
        status: 'RUNTIME_ERROR',
        timeMs: 0,
        memoryMb: 0,
        output: null,
        error: err.message,
      });
    }
  }

  try {
    if (results.length > 0) {
      try { await prisma.testCaseResult.createMany({ data: results as any, skipDuplicates: true }); }
      catch (e) { for (const r of results) await prisma.testCaseResult.create({ data: r }); }
    }
    const allPassed = passedCount === testCases.length && testCases.length > 0;
    const finalStatus = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';
    const score = allPassed ? 100 : Math.round((passedCount / Math.max(1, testCases.length)) * 100);
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: finalStatus as any, score, timeMsTotal: totalTime } as any,
    });
    console.log(`[Java Worker] Submission ${submissionId} finalizado: ${finalStatus}`);
    return { submissionId, finalStatus, passedCount, totalTestCases: testCases.length, totalTimeMs: totalTime };
  } catch (e: any) {
    console.error('[Java Worker] Error guardando resultados:', e.message);
    try { await prisma.submission.update({ where: { id: submissionId }, data: { status: 'RUNTIME_ERROR' } as any }); }
    catch (ee: any) { console.warn('Could not mark RUNTIME_ERROR:', ee.message); }
    throw e;
  }
});

submissionQueue.on('completed', (job: Job) => console.log(`[Java Worker] Job ${job.id} completado`));
submissionQueue.on('failed', (job: Job, err: Error) => console.error(`[Java Worker] Job ${job.id} falló:`, err.message));
process.on('SIGTERM', async () => { console.log('[Java Worker] Cerrando...'); await submissionQueue.close(); process.exit(0); });
```

---

## 5. 🔴 CRÍTICO: Implementar C++ Worker

**Archivo:** `workers/cpp-worker/worker.ts`

Reemplazar con contenido similar al Java Worker, pero:

```typescript
// Cambiar comando de compilación:
// Para Java:    javac Solution.java
// Para C++:     g++ -o /tmp/solution /tmp/solution.cpp

// Cambiar comando de ejecución:
// Para Java:    java Solution
// Para C++:     /tmp/solution

// Cambiar imagen Docker:
// Para Java:    openjdk:21-slim
// Para C++:     gcc:latest  o  gcc:13-bookworm
```

---

## 6. 🔴 CRÍTICO: Crear CodeEditor Component

**Archivo:** `frontend/components/code-editor.tsx` (NUEVA)

```typescript
'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

type Language = 'PYTHON' | 'JAVA' | 'NODEJS' | 'CPP'

const LANGUAGE_CONFIG: Record<Language, { name: string; defaultCode: string; monacoLang: string }> = {
  PYTHON: {
    name: 'Python',
    defaultCode: 'def solution():\n    pass\n',
    monacoLang: 'python',
  },
  JAVA: {
    name: 'Java',
    defaultCode: 'public class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n',
    monacoLang: 'java',
  },
  NODEJS: {
    name: 'Node.js',
    defaultCode: 'function solution() {\n    \n}\n',
    monacoLang: 'javascript',
  },
  CPP: {
    name: 'C++',
    defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
    monacoLang: 'cpp',
  },
}

interface CodeEditorProps {
  challengeId: string
  courseId: string
  onSubmit?: (result: any) => void
}

export function CodeEditor({ challengeId, courseId, onSubmit }: CodeEditorProps) {
  const [language, setLanguage] = useState<Language>('PYTHON')
  const [code, setCode] = useState(LANGUAGE_CONFIG[language].defaultCode)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setCode(LANGUAGE_CONFIG[newLang].defaultCode)
    setResult(null)
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Por favor escribe código')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.submissionsApi.submit({
        challengeId,
        courseId,
        code,
        language,
      })

      setResult(response)
      onSubmit?.(response)
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Editor de Código</CardTitle>
          <CardDescription>Escribe tu solución aquí</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Lenguaje:</label>
            <Select value={language} onValueChange={handleLanguageChange as any}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PYTHON">Python</SelectItem>
                <SelectItem value="JAVA">Java</SelectItem>
                <SelectItem value="NODEJS">Node.js</SelectItem>
                <SelectItem value="CPP">C++</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <Editor
              height="100%"
              language={LANGUAGE_CONFIG[language].monacoLang}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
              }}
            />
          </div>

          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Enviando...' : 'Enviar Solución'}
          </Button>
        </CardContent>
      </Card>

      {result && <SubmissionResults data={result} />}
    </div>
  )
}

function SubmissionResults({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Estado:</span>{' '}
            <span className={data.status === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}>{data.status}</span>
          </div>
          <div>
            <span className="font-medium">Puntuación:</span> {data.score}%
          </div>
          <div>
            <span className="font-medium">Tiempo:</span> {data.timeMsTotal}ms
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Instalar Monaco Editor:**
```bash
cd /workspaces/codium/frontend
npm install @monaco-editor/react
```

---

## 7. 🔴 CRÍTICO: Corregir API URL en docker-compose

**Archivo:** `docker-compose.yml`

**Cambiar línea 56 de:**
```yaml
frontend:
  environment:
    NEXT_PUBLIC_API_URL: http://localhost:3001
```

**A:**
```yaml
frontend:
  environment:
    NEXT_PUBLIC_API_URL: http://api:3000/api
```

---

## CHECKLIST DE IMPLEMENTACIÓN

```
CRÍTICO (Bloquea todo):
☐ 1. Agregar modelo Group a schema.prisma
☐ 2. Corregir login accessToken desalineación
☐ 3. Decidir arquitectura submissions (workers vs API)
☐ 4. Implementar Java worker
☐ 5. Implementar C++ worker
☐ 6. Crear CodeEditor component
☐ 7. Corregir API URL en docker-compose
☐ Ejecutar migraciones: npx prisma migrate dev
☐ Reiniciar servicios: docker-compose down && docker-compose up --build

ALTO (Afecta experiencia):
☐ 8. Componente SubmissionResults
☐ 9. Evaluation Timer component
☐ 10. Completar EnrollmentsModule

MEDIO (Mejoras):
☐ 11. Conectar Dashboard a APIs
☐ 12. Global AuthContext
☐ 13. Agregar paginación
☐ 14. Logging centralizado
```

---

**Tiempo estimado total para CRÍTICOS: 4-6 horas**
