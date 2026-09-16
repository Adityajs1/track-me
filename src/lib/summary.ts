import { format, isWithinInterval, startOfDay, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { DaySummary, GoalMetrics, HeatmapColor } from './types';

interface TaskInput {
  id: string;
  targetDate: Date | string | null;
  done: boolean;
  isRecurring: boolean;
  createdAt: Date | string;
  instances?: Array<{
    date: Date | string;
    done: boolean;
  }>;
}

interface GoalInput {
  id: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  tasks: TaskInput[];
}

export function computeDaySummary(
  date: Date,
  goal: GoalInput
): DaySummary {
  const dateStr = format(date, 'yyyy-MM-dd');
  const targetDay = startOfDay(date);

  const goalStart = startOfDay(new Date(goal.startDate));
  const goalEnd = goal.endDate ? startOfDay(new Date(goal.endDate)) : null;

  // Check if target day is within goal timeframe
  const isGoalActive = targetDay >= goalStart && (!goalEnd || targetDay <= goalEnd);

  let plannedCount = 0;
  let doneCount = 0;

  if (isGoalActive) {
    for (const task of goal.tasks) {
      if (task.isRecurring) {
        // Recurring task is planned every day the goal is active
        plannedCount++;
        // Check instance for this date
        const instance = task.instances?.find((inst) => {
          const instDateStr = format(new Date(inst.date), 'yyyy-MM-dd');
          return instDateStr === dateStr;
        });
        if (instance?.done) {
          doneCount++;
        }
      } else if (task.targetDate) {
        // One-off task planned on targetDate
        const taskTargetStr = format(new Date(task.targetDate), 'yyyy-MM-dd');
        if (taskTargetStr === dateStr) {
          plannedCount++;
          if (task.done) {
            doneCount++;
          }
        }
      }
    }
  }

  let completionRate = 0;
  let color: HeatmapColor = 'none';
  let points = 0;

  if (plannedCount > 0) {
    completionRate = doneCount / plannedCount;
    if (completionRate >= 0.8) {
      color = 'green';
    } else if (completionRate >= 0.3) {
      color = 'yellow';
    } else {
      color = 'red';
    }

    // Points calculation:
    // 10 pts per completed task
    points += doneCount * 10;
    // 25 bonus pts for reaching 80%+ day completion
    if (completionRate >= 0.8) {
      points += 25;
    }
  }

  return {
    date: dateStr,
    plannedCount,
    doneCount,
    completionRate,
    color,
    points,
  };
}

export function computeGoalMetrics(
  goal: GoalInput,
  daysCount: number = 90
): GoalMetrics {
  const today = startOfDay(new Date());
  const startDate = subDays(today, daysCount - 1);
  const intervalDays = eachDayOfInterval({ start: startDate, end: today });

  const daysSummary: DaySummary[] = [];
  let totalPoints = 0;
  let totalCompletedTasks = 0;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (const day of intervalDays) {
    const summary = computeDaySummary(day, goal);
    daysSummary.push(summary);

    totalPoints += summary.points;
    totalCompletedTasks += summary.doneCount;

    // Streak logic: A high completion day (>= 80%) continues or starts streak.
    // Days with nothing planned do NOT break streak (e.g. resting/no tasks).
    if (summary.plannedCount > 0) {
      if (summary.completionRate >= 0.8) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
  }

  // Calculate current streak from today backwards
  let currentStreakCount = 0;
  for (let i = daysSummary.length - 1; i >= 0; i--) {
    const day = daysSummary[i];
    if (day.plannedCount === 0) {
      // Resting day doesn't break current streak
      continue;
    }
    if (day.completionRate >= 0.8) {
      currentStreakCount++;
    } else {
      break;
    }
  }
  currentStreak = currentStreakCount;

  // Add streak bonus points
  const streakBonus = currentStreak * 5;
  totalPoints += streakBonus;

  return {
    totalPoints,
    currentStreak,
    longestStreak,
    totalCompletedTasks,
    daysSummary,
  };
}
