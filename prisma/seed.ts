import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database to clean initial state (Zero hardcoded data)...');

  // Clean all records
  await prisma.timeBlock.deleteMany();
  await prisma.taskInstance.deleteMany();
  await prisma.task.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.note.deleteMany();
  await prisma.goal.deleteMany();

  console.log('Database clean. Ready for dynamic user input.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
