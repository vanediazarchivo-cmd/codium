#!/bin/bash

# Script de verificación del proyecto Codium

echo "=========================================="
echo "🔍 VERIFICACIÓN DEL PROYECTO CODIUM"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
    return 0
  else
    echo -e "${RED}❌${NC} FALTA: $1"
    return 1
  fi
}

check_method() {
  if grep -q "$2" "$1"; then
    echo -e "${GREEN}✅${NC} $1 contiene: $2"
    return 0
  else
    echo -e "${RED}❌${NC} $1 NO contiene: $2"
    return 1
  fi
}

echo "📦 ARCHIVOS CREADOS/MODIFICADOS"
echo "==============================="
check_file "src/core/application/courses/usecases/update-course.usecase.ts"
check_file "src/core/application/courses/usecases/delete-course.usecase.ts"
check_file "src/core/application/courses/dto/update-course.dto.ts"
check_file ".env"
check_file ".env.example"
check_file "frontend/lib/api-client.ts"

echo ""
echo "🔧 CAMBIOS EN CONTROLADOR"
echo "========================="
check_method "src/interface/http/courses/courses.controller.ts" "UpdateCourseUseCase"
check_method "src/interface/http/courses/courses.controller.ts" "DeleteCourseUseCase"
check_method "src/interface/http/courses/courses.controller.ts" "@Patch"
check_method "src/interface/http/courses/courses.controller.ts" "@Delete"

echo ""
echo "📋 API CLIENT"
echo "============="
check_method "frontend/lib/api-client.ts" "listUserSubmissions"
check_method "frontend/lib/api-client.ts" "update:"
check_method "frontend/lib/api-client.ts" "delete:"

echo ""
echo "🐳 DOCKER"
echo "========"
check_method "docker-compose.yml" "http://localhost:3000/api"
check_method "Dockerfile.frontend" "EXPOSE 3000"

echo ""
echo "📦 COMPILACIÓN"
echo "=============="
if [ -d "dist" ] && [ -f "dist/main.js" ]; then
  echo -e "${GREEN}✅${NC} Backend compilado: dist/ existe"
  
  if [ -f "dist/core/application/courses/usecases/update-course.usecase.js" ]; then
    echo -e "${GREEN}✅${NC} UpdateCourseUseCase compilado"
  else
    echo -e "${RED}❌${NC} UpdateCourseUseCase NO compilado"
  fi
  
  if [ -f "dist/core/application/courses/usecases/delete-course.usecase.js" ]; then
    echo -e "${GREEN}✅${NC} DeleteCourseUseCase compilado"
  else
    echo -e "${RED}❌${NC} DeleteCourseUseCase NO compilado"
  fi
  
  if grep -q "updateCourse\|deleteCourse" dist/interface/http/courses/courses.controller.js; then
    echo -e "${GREEN}✅${NC} CoursesController actualizado"
  else
    echo -e "${RED}❌${NC} CoursesController NO actualizado"
  fi
else
  echo -e "${RED}❌${NC} Backend NO compilado: ejecutar 'pnpm run build'"
fi

echo ""
echo "=========================================="
echo "✅ VERIFICACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "  1. Verificar que no hay errores de compilación TypeScript"
echo "  2. Ejecutar: docker-compose up --build -d"
echo "  3. Ejecutar: docker exec codium-api sh -c 'pnpm exec prisma db seed'"
echo "  4. Acceder a: http://localhost:3001 (frontend)"
echo "  5. API Swagger: http://localhost:3000/docs"
