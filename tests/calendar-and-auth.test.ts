import {
  timeToMinutes,
  minutesToTime,
  formatTime12,
  getWeekDates,
  getMonthMatrix,
  layoutDayBlocks,
  formatDateHeading,
  isSameDay,
} from '../src/lib/calendarUtils';
import { hashPassword, verifyPassword } from '../src/lib/auth';
import { TimeBlockData } from '../src/lib/types';
import prisma from '../src/lib/prisma';
import assert from 'assert';

async function runTests() {
  console.log('--- 1. Testing Calendar Utility Functions ---');

  // Test timeToMinutes & minutesToTime
  assert.strictEqual(timeToMinutes('00:00'), 0);
  assert.strictEqual(timeToMinutes('09:30'), 570);
  assert.strictEqual(timeToMinutes('23:45'), 1425);
  assert.strictEqual(minutesToTime(570), '09:30');
  assert.strictEqual(minutesToTime(1425), '23:45');
  console.log('✓ Time conversion tests passed');

  // Test formatTime12
  assert.strictEqual(formatTime12('09:30'), '9:30 AM');
  assert.strictEqual(formatTime12('12:00'), '12:00 PM');
  assert.strictEqual(formatTime12('15:45'), '3:45 PM');
  assert.strictEqual(formatTime12('00:15'), '12:15 AM');
  console.log('✓ 12-hour time formatting tests passed');

  // Test getWeekDates
  const sampleWednesday = new Date('2026-10-21T12:00:00Z');
  const weekDates = getWeekDates(sampleWednesday);
  assert.strictEqual(weekDates.length, 7);
  // Monday of that week is Oct 19
  assert.strictEqual(weekDates[0].getDate(), 19);
  // Sunday of that week is Oct 25
  assert.strictEqual(weekDates[6].getDate(), 25);
  console.log('✓ getWeekDates returns Monday-Sunday 7-day span');

  // Test getMonthMatrix
  const monthMatrix = getMonthMatrix(new Date('2026-10-01T00:00:00Z'));
  assert.ok(monthMatrix.length >= 5);
  assert.strictEqual(monthMatrix[0].length, 7);
  console.log('✓ getMonthMatrix returns valid calendar grid');

  // Test layoutDayBlocks with overlapping events
  const mockBlocks: TimeBlockData[] = [
    {
      id: '1',
      title: 'Block A',
      color: '#3B82F6',
      date: '2026-10-22',
      startTime: '10:00',
      endTime: '11:00',
      taskId: null,
      taskInstanceId: null,
    },
    {
      id: '2',
      title: 'Block B (Overlapping)',
      color: '#FF4FA3',
      date: '2026-10-22',
      startTime: '10:30',
      endTime: '11:30',
      taskId: null,
      taskInstanceId: null,
    },
    {
      id: '3',
      title: 'Block C (Non-overlapping)',
      color: '#10B981',
      date: '2026-10-22',
      startTime: '13:00',
      endTime: '14:00',
      taskId: null,
      taskInstanceId: null,
    },
  ];

  const positioned = layoutDayBlocks(mockBlocks, 0, 60);
  assert.strictEqual(positioned.length, 3);

  const blockA = positioned.find((p) => p.block.id === '1')!;
  const blockB = positioned.find((p) => p.block.id === '2')!;
  const blockC = positioned.find((p) => p.block.id === '3')!;

  // Block A is at top 10 * 60 = 600px, duration 60 mins = 60px
  assert.strictEqual(blockA.top, 600);
  assert.strictEqual(blockA.height, 60);

  // Block B overlaps with Block A -> total columns = 2, width ~ 50%
  assert.ok(blockA.widthPercent < 60);
  assert.ok(blockB.widthPercent < 60);
  assert.notStrictEqual(blockA.leftPercent, blockB.leftPercent);

  // Block C does not overlap -> takes full column (100%)
  assert.strictEqual(blockC.leftPercent, 0);
  assert.strictEqual(blockC.widthPercent, 100);
  console.log('✓ Overlap layout algorithm properly assigns columns and proportions');

  console.log('\n--- 2. Testing Password Hashing & Auth Utilities ---');
  const password = 'SuperSecurePassword123!';
  const hash = hashPassword(password);
  assert.ok(hash.includes(':'), 'Hash format must be salt:hash');
  assert.strictEqual(verifyPassword(password, hash), true, 'Password verification must succeed');
  assert.strictEqual(verifyPassword('WrongPassword', hash), false, 'Wrong password must be rejected');
  console.log('✓ Secure password hashing and verification passed');

  console.log('\n--- 3. Testing Database Isolation & Access Control ---');
  // Clean test data
  await prisma.timeBlock.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create two separate users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      passwordHash: hashPassword('password123'),
      name: 'User One',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      passwordHash: hashPassword('password123'),
      name: 'User Two',
    },
  });

  // User 1 creates a time block
  const block1 = await prisma.timeBlock.create({
    data: {
      userId: user1.id,
      title: 'User 1 Focus Session',
      color: '#3B82F6',
      date: new Date('2026-10-22T00:00:00Z'),
      startTime: '09:00',
      endTime: '10:30',
    },
  });

  // User 2 creates a time block
  const block2 = await prisma.timeBlock.create({
    data: {
      userId: user2.id,
      title: 'User 2 Private Meeting',
      color: '#FF4FA3',
      date: new Date('2026-10-22T00:00:00Z'),
      startTime: '14:00',
      endTime: '15:00',
    },
  });

  // Query User 1 blocks: User 2's block must NEVER be returned
  const user1Blocks = await prisma.timeBlock.findMany({
    where: { userId: user1.id },
  });
  assert.strictEqual(user1Blocks.length, 1);
  assert.strictEqual(user1Blocks[0].title, 'User 1 Focus Session');
  assert.strictEqual(user1Blocks[0].color, '#3B82F6');
  console.log('✓ Multi-tenant user event scoping verified (User 1 cannot see User 2 blocks)');

  // Clean up test data
  await prisma.timeBlock.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Test cleanup finished');

  console.log('\n=======================================');
  console.log('ALL TIME-BLOCKING TESTS PASSED (100%)');
  console.log('=======================================');
}

runTests()
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
