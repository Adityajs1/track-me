import { PrismaClient } from '@prisma/client';
import { subDays, startOfDay, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing records
  await prisma.timeBlock.deleteMany();
  await prisma.taskInstance.deleteMany();
  await prisma.task.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.note.deleteMany();
  await prisma.goal.deleteMany();

  const today = startOfDay(new Date());

  // 1. Goal: Marathon 10K Training (Health & Fitness)
  const marathonGoal = await prisma.goal.create({
    data: {
      name: 'Run a 10K Marathon',
      category: 'Health & Fitness',
      startDate: subDays(today, 30),
      endDate: addDays(today, 60),
    },
  });

  // Plan under Marathon
  const basePhase = await prisma.plan.create({
    data: {
      goalId: marathonGoal.id,
      name: 'Phase 1: Aerobic Base Building',
      startDate: subDays(today, 30),
      endDate: today,
    },
  });

  // One-off task under Plan
  const buyShoesTask = await prisma.task.create({
    data: {
      goalId: marathonGoal.id,
      planId: basePhase.id,
      title: 'Get fitted for running shoes',
      targetDate: subDays(today, 20),
      done: true,
      isRecurring: false,
    },
  });

  // Recurring task under Goal
  const morningRunHabit = await prisma.task.create({
    data: {
      goalId: marathonGoal.id,
      title: 'Morning 5km Run',
      isRecurring: true,
      done: false,
    },
  });

  // Generate instances for morning run over last 14 days
  for (let i = 14; i >= 0; i--) {
    const d = subDays(today, i);
    // Complete 80% of past runs
    const isDone = i % 4 !== 0;
    await prisma.taskInstance.create({
      data: {
        taskId: morningRunHabit.id,
        date: d,
        done: isDone,
      },
    });
  }

  // 2. Goal: Master Full-Stack Engineering (Career)
  const fullstackGoal = await prisma.goal.create({
    data: {
      name: 'Master Modern Full-Stack Development',
      category: 'Career & Skills',
      startDate: subDays(today, 45),
      endDate: addDays(today, 90),
    },
  });

  const nextjsPlan = await prisma.plan.create({
    data: {
      goalId: fullstackGoal.id,
      name: 'Deep Dive: Next.js 15 & System Design',
      startDate: subDays(today, 20),
      endDate: addDays(today, 10),
    },
  });

  const codingHabit = await prisma.task.create({
    data: {
      goalId: fullstackGoal.id,
      title: '1 Hour of Focused Coding / System Design',
      isRecurring: true,
      done: false,
    },
  });

  for (let i = 14; i >= 0; i--) {
    const d = subDays(today, i);
    const isDone = i !== 2 && i !== 6;
    await prisma.taskInstance.create({
      data: {
        taskId: codingHabit.id,
        date: d,
        done: isDone,
      },
    });
  }

  const readPaperTask = await prisma.task.create({
    data: {
      goalId: fullstackGoal.id,
      planId: nextjsPlan.id,
      title: 'Read Google Spanner architecture whitepaper',
      targetDate: today,
      done: false,
      isRecurring: false,
    },
  });

  // Timeblocks for today
  await prisma.timeBlock.create({
    data: {
      taskId: readPaperTask.id,
      date: today,
      startTime: '14:00',
      endTime: '15:30',
    },
  });

  // 3. Notes
  await prisma.note.create({
    data: {
      goalId: marathonGoal.id,
      title: 'Pacing & Cadence Breakthrough',
      content: 'Felt effortless keeping 5:15/km pace today with high cadence and nose-breathing. Recovery feeling great.',
    },
  });

  await prisma.note.create({
    data: {
      goalId: null, // general journal
      title: 'Weekly Reflection & Mental Clarity',
      content: 'Consistently focusing on just 2 main goals has significantly reduced cognitive fatigue. Evening wind-down routine is helping deep sleep.',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
