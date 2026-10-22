export interface UserData {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

export interface GoalData {
  id: string;
  userId?: string | null;
  name: string;
  category: string;
  startDate: string;
  endDate: string | null;
  isCompleted?: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  plans?: PlanData[];
  tasks?: TaskData[];
  notes?: NoteData[];
  _count?: {
    plans: number;
    tasks: number;
    notes: number;
  };
  metrics?: GoalMetrics;
}

export interface PlanData {
  id: string;
  goalId: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tasks?: TaskData[];
}

export interface TaskData {
  id: string;
  goalId: string;
  planId: string | null;
  title: string;
  targetDate: string | null;
  done: boolean;
  isRecurring: boolean;
  frequency?: string;
  createdAt: string;
  updatedAt: string;
  instances?: TaskInstanceData[];
  timeBlocks?: TimeBlockData[];
  goal?: {
    id: string;
    name: string;
    category: string;
  };
  plan?: {
    id: string;
    name: string;
  } | null;
}

export interface TaskInstanceData {
  id: string;
  taskId: string;
  date: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  task?: TaskData;
  timeBlocks?: TimeBlockData[];
}

export interface TimeBlockData {
  id: string;
  userId?: string | null;
  title: string;
  description?: string | null;
  color: string;
  taskId: string | null;
  taskInstanceId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
  task?: TaskData;
  taskInstance?: TaskInstanceData;
}

export interface NoteData {
  id: string;
  userId?: string | null;
  goalId: string | null;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  goal?: {
    id: string;
    name: string;
    category: string;
  } | null;
}

export interface DailyCheckInData {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  energy?: number | null;
  mood?: string | null;
  reflection?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type HeatmapColor = 'none' | 'green' | 'yellow' | 'red';

export interface DaySummary {
  date: string; // YYYY-MM-DD
  plannedCount: number;
  doneCount: number;
  completionRate: number; // 0 to 1
  color: HeatmapColor;
  points: number;
}

export interface GoalMetrics {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletedTasks: number;
  daysSummary: DaySummary[];
}

export interface ProductivityDayData {
  date: string; // YYYY-MM-DD
  totalEvents: number;
  goalsCompletedCount: number;
  habitsCompletedCount: number;
  hasCheckIn: boolean;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface ProductivityOverviewData {
  totalEvents: number;
  currentStreak: number;
  longestStreak: number;
  totalGoalsCompleted: number;
  totalHabitCompletions: number;
  totalCheckIns: number;
  days: ProductivityDayData[];
}
