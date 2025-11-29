import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up previous data
  await prisma.testCaseResult.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.evaluationChallenge.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.courseStudent.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@codium.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  const professorPassword = await bcrypt.hash("professor123", 10);
  const professor = await prisma.user.create({
    data: {
      email: "professor@codium.com",
      password: professorPassword,
      firstName: "John",
      lastName: "Doe",
      role: "PROFESSOR",
    },
  });

  const studentPassword = await bcrypt.hash("student123", 10);
  const student1 = await prisma.user.create({
    data: {
      email: "student1@codium.com",
      password: studentPassword,
      firstName: "Alice",
      lastName: "Smith",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "student2@codium.com",
      password: studentPassword,
      firstName: "Bob",
      lastName: "Johnson",
      role: "STUDENT",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: "student3@codium.com",
      password: studentPassword,
      firstName: "Carlos",
      lastName: "López",
      role: "STUDENT",
    },
  });

  // Create courses
  const course1 = await prisma.course.create({
    data: {
      name: "Desarrollo de Aplicaciones Backend",
      code: "NRC12345",
      group: 1,
      semester: "2025-I",
      professors: {
        connect: { id: professor.id },
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: "Algoritmos Avanzados",
      code: "NRC12346",
      group: 2,
      semester: "2025-I",
      professors: {
        connect: { id: professor.id },
      },
    },
  });

  // Enroll students
  await prisma.courseStudent.createMany({
    data: [
      { courseId: course1.id, studentId: student1.id },
      { courseId: course1.id, studentId: student2.id },
      { courseId: course1.id, studentId: student3.id },
      { courseId: course2.id, studentId: student1.id },
      { courseId: course2.id, studentId: student2.id },
    ],
  });

  // Create challenges for course 1
  const challenge1 = await prisma.challenge.create({
    data: {
      title: "Two Sum",
      description:
        "Dado un arreglo de enteros nums y un entero target, devuelve los índices de los dos números que suman target.",
      difficulty: "EASY",
      tags: ["arrays", "hashmap"],
      timeLimit: 1500,
      memoryLimit: 256,
      status: "PUBLISHED",
      courseId: course1.id,
      createdById: professor.id,
      testCases: {
        create: [
          {
            input: "[2,7,11,15]\n9",
            expectedOutput: "[0,1]",
            isHidden: false,
            points: 50,
            order: 1,
          },
          {
            input: "[3,2,4]\n6",
            expectedOutput: "[1,2]",
            isHidden: true,
            points: 50,
            order: 2,
          },
        ],
      },
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: "Búsqueda Binaria",
      description: "Implementa búsqueda binaria en un arreglo ordenado.",
      difficulty: "EASY",
      tags: ["búsqueda", "arrays"],
      timeLimit: 1000,
      memoryLimit: 128,
      status: "PUBLISHED",
      courseId: course1.id,
      createdById: professor.id,
      testCases: {
        create: [
          {
            input: "[1,3,5,7,9]\n5",
            expectedOutput: "2",
            isHidden: false,
            points: 50,
            order: 1,
          },
          {
            input: "[1,3,5,7,9]\n6",
            expectedOutput: "-1",
            isHidden: false,
            points: 50,
            order: 2,
          },
        ],
      },
    },
  });

  const challenge3 = await prisma.challenge.create({
    data: {
      title: "Quicksort",
      description: "Implementa el algoritmo de ordenamiento Quicksort.",
      difficulty: "MEDIUM",
      tags: ["ordenamiento", "algoritmos"],
      timeLimit: 2000,
      memoryLimit: 256,
      status: "PUBLISHED",
      courseId: course1.id,
      createdById: professor.id,
      testCases: {
        create: [
          {
            input: "[64,34,25,12,22,11,90]",
            expectedOutput: "[11,12,22,25,34,64,90]",
            isHidden: false,
            points: 100,
            order: 1,
          },
        ],
      },
    },
  });

  // Create challenges for course 2
  const challenge4 = await prisma.challenge.create({
    data: {
      title: "Dijkstra",
      description: "Implementa el algoritmo de Dijkstra para encontrar el camino más corto.",
      difficulty: "HARD",
      tags: ["grafos", "algoritmos", "dijkstra"],
      timeLimit: 3000,
      memoryLimit: 512,
      status: "PUBLISHED",
      courseId: course2.id,
      createdById: professor.id,
      testCases: {
        create: [
          {
            input: "6\n0 1 4\n0 2 2\n1 3 5\n2 3 8\n3 5 2\n4 5 10\n0\n5",
            expectedOutput: "10",
            isHidden: false,
            points: 100,
            order: 1,
          },
        ],
      },
    },
  });

  // Create sample submissions
  const now = new Date();
  const submission1 = await prisma.submission.create({
    data: {
      userId: student1.id,
      challengeId: challenge1.id,
      courseId: course1.id,
      code: "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n",
      language: "PYTHON",
      status: "ACCEPTED",
      score: 100,
      timeMsTotal: 450,
      memoryUsedMb: 45,
      createdAt: new Date(now.getTime() - 86400000),
    },
  });

  const submission2 = await prisma.submission.create({
    data: {
      userId: student2.id,
      challengeId: challenge1.id,
      courseId: course1.id,
      code: "int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[]{map.get(complement), i};\n        }\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}\n",
      language: "JAVA",
      status: "WRONG_ANSWER",
      score: 50,
      timeMsTotal: 320,
      memoryUsedMb: 62,
      createdAt: new Date(now.getTime() - 86400000),
    },
  });

  // Create evaluation
  const evaluation1 = await prisma.evaluation.create({
    data: {
      name: "Examen Parcial 1",
      description: "Evaluación sobre estructura de datos y algoritmos básicos",
      courseId: course1.id,
      status: "PUBLISHED",
      startDate: new Date(now.getTime() - 3600000),
      endDate: new Date(now.getTime() + 86400000),
      challenges: {
        create: [
          {
            challengeId: challenge1.id,
            order: 1,
          },
          {
            challengeId: challenge2.id,
            order: 2,
          },
        ],
      },
    },
  });

  const evaluation2 = await prisma.evaluation.create({
    data: {
      name: "Examen Final",
      description: "Evaluación final de algoritmos avanzados",
      courseId: course2.id,
      status: "DRAFT",
      startDate: new Date(now.getTime() + 604800000),
      endDate: new Date(now.getTime() + 691200000),
      challenges: {
        create: [
          {
            challengeId: challenge4.id,
            order: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Credenciales de prueba:");
  console.log("👤 Admin:     admin@codium.com / admin123");
  console.log("👨‍🏫 Profesor:   professor@codium.com / professor123");
  console.log("👨‍🎓 Estudiante: student1@codium.com / student123");
  console.log("              student2@codium.com / student123");
  console.log("              student3@codium.com / student123");
  console.log("\n📊 Datos creados:");
  console.log(`✓ ${3} usuarios: 1 admin, 1 profesor, 3 estudiantes`);
  console.log(`✓ ${2} cursos con ${5} inscripciones`);
  console.log(`✓ ${4} retos publicados`);
  console.log(`✓ ${2} evaluaciones`);
  console.log(`✓ ${2} submissions de ejemplo`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });