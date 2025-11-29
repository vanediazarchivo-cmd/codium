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
  await prisma.groupStudent.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.courseStudent.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const professorPassword = await bcrypt.hash("professor123", 10);
  const professor = await prisma.user.create({
    data: {
      email: "professor@codium.com",
      password: professorPassword,
      firstName: "Juan",
      lastName: "Profesor",
      role: "PROFESSOR",
    },
  });

  // Crear un segundo profesor que antes era el 'admin'
  const professor2 = await prisma.user.create({
    data: {
      email: "professor2@codium.com",
      password: professorPassword,
      firstName: "Admin",
      lastName: "Profesor",
      role: "PROFESSOR",
    },
  });

  const studentPassword = await bcrypt.hash("student123", 10);
  const student1 = await prisma.user.create({
    data: {
      email: "student1@codium.com",
      password: studentPassword,
      firstName: "Carlos",
      lastName: "Estudiante",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "student2@codium.com",
      password: studentPassword,
      firstName: "María",
      lastName: "López",
      role: "STUDENT",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: "student3@codium.com",
      password: studentPassword,
      firstName: "Ana",
      lastName: "Gómez",
      role: "STUDENT",
    },
  });

  console.log("✅ Users created");

  // Create course
  const course = await prisma.course.create({
    data: {
      name: "Programación Orientada a Objetos",
      code: "POO-2025",
      semester: "2025-I",
      professors: {
        connect: { id: professor.id },
      },
    },
  });

  console.log("✅ Course created");

  // Create groups
  const group1 = await prisma.group.create({
    data: {
      courseId: course.id,
      number: 1,
      name: "Grupo 01",
      description: "Sección matutina",
    },
  });

  const group2 = await prisma.group.create({
    data: {
      courseId: course.id,
      number: 2,
      name: "Grupo 02",
      description: "Sección vespertina",
    },
  });

  console.log("✅ Groups created");

  // Enroll students in groups
  await prisma.groupStudent.createMany({
    data: [
      { groupId: group1.id, studentId: student1.id },
      { groupId: group1.id, studentId: student2.id },
    ],
  });

  console.log("✅ Students enrolled in groups");

  // Create challenges for group 1
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
      groupId: group1.id,
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
            isHidden: false,
            points: 50,
            order: 2,
          },
        ],
      },
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: "Merge Sorted Array",
      description: "Fusiona dos arreglos ordenados en uno solo.",
      difficulty: "EASY",
      tags: ["arrays", "merge"],
      timeLimit: 2000,
      memoryLimit: 256,
      status: "PUBLISHED",
      groupId: group1.id,
      createdById: professor.id,
      testCases: {
        create: [
          {
            input: "[1,2,3]\n[2,5,6]",
            expectedOutput: "[1,2,2,3,5,6]",
            isHidden: false,
            points: 50,
            order: 1,
          },
          {
            input: "[0]\n[0]",
            expectedOutput: "[0,0]",
            isHidden: false,
            points: 50,
            order: 2,
          },
        ],
      },
    },
  });

  console.log("✅ Challenges created");

  // Create evaluation
  const evaluation = await prisma.evaluation.create({
    data: {
      name: "Parcial 1",
      description: "Primera evaluación del semestre",
      groupId: group1.id,
      status: "PUBLISHED",
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
    },
  });

  // Add challenges to evaluation
  await prisma.evaluationChallenge.createMany({
    data: [
      { evaluationId: evaluation.id, challengeId: challenge1.id, order: 1 },
      { evaluationId: evaluation.id, challengeId: challenge2.id, order: 2 },
    ],
  });

  console.log("✅ Evaluation created");

  // Create submission example
  const submission = await prisma.submission.create({
    data: {
      userId: student1.id,
      challengeId: challenge1.id,
      groupId: group1.id,
      evaluationId: evaluation.id,
      code: "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
      language: "PYTHON",
      status: "ACCEPTED",
      score: 100,
      timeMsTotal: 120,
      memoryUsedMb: 45.5,
    },
  });

  // Get test cases and add results
  const testCases = await prisma.testCase.findMany({
    where: { challengeId: challenge1.id },
  });

  await prisma.testCaseResult.createMany({
    data: testCases.map((tc, idx) => ({
      submissionId: submission.id,
      testCaseId: tc.id,
      status: "PASS",
      timeMs: 60,
      memoryMb: 22.5 + idx * 0.5,
      output: idx === 0 ? "[0,1]" : "[1,2]",
    })),
  });

  console.log("✅ Submission example created");

  // Create more submissions for leaderboard
  for (let i = 0; i < 5; i++) {
    await prisma.submission.create({
      data: {
        userId: i % 2 === 0 ? student1.id : student2.id,
        challengeId: challenge1.id,
        groupId: group1.id,
        code: "def solution():\n    pass",
        language: "PYTHON",
        status: "ACCEPTED",
        score: 100 - i * 10,
        timeMsTotal: 150 + i * 50,
        memoryUsedMb: 50,
      },
    });
  }

  console.log("✨ Database seeded successfully!");

}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
