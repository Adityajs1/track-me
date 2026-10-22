'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import useSWR from 'swr';
import { TaskData, TimeBlockData } from '@/lib/types';
import {
  CALENDAR_COLORS,
  timeToMinutes,
  minutesToTime,
  formatTime12,
  getWeekDates,
  getMonthMatrix,
  layoutDayBlocks,
  formatDateHeading,
  isSameDay,
} from '@/lib/calendarUtils';
import { TimeBlockModal } from './TimeBlockModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday as dateFnsIsToday,
} from 'date-fns';

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  });

interface TimeBlockingViewProps {
  tasks: TaskData[];
  selectedDate?: Date;
  onDateChange?: (d: Date) => void;
  // Fallbacks if provided by parent
  timeBlocks?: TimeBlockData[];
  onCreateTimeBlock?: (block: any) => Promise<void>;
  onDeleteTimeBlock?: (id: string) => Promise<void>;
}

const HOURS_COUNT = 24; // 00:00 to 23:00
const PIXELS_PER_HOUR = 60; // 1 min = 1px

export const TimeBlockingView: React.FC<TimeBlockingViewProps> = ({
  tasks,
  selectedDate: propSelectedDate,
  onDateChange: propOnDateChange,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(propSelectedDate || new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialBlock, setModalInitialBlock] = useState<Partial<TimeBlockData> | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (propSelectedDate) {
      setCurrentDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    if (propOnDateChange) {
      propOnDateChange(newDate);
    }
  };

  // Timeline Scroll Container Ref for auto-scrolling to 8:00 AM on initial load
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (timelineScrollRef.current && (view === 'day' || view === 'week')) {
      // 8 AM = 8 * 60 = 480px
      timelineScrollRef.current.scrollTop = 450;
    }
  }, [view]);

  // Current time position indicator
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // Compute active date range based on view
  const { startDateStr, endDateStr } = useMemo(() => {
    if (view === 'day') {
      const d = format(currentDate, 'yyyy-MM-dd');
      return { startDateStr: d, endDateStr: d };
    }
    if (view === 'week') {
      const weekDays = getWeekDates(currentDate);
      return {
        startDateStr: format(weekDays[0], 'yyyy-MM-dd'),
        endDateStr: format(weekDays[6], 'yyyy-MM-dd'),
      };
    }
    // month view (includes padding days from previous/next months)
    const monthMatrix = getMonthMatrix(currentDate);
    const firstDay = monthMatrix[0][0].date;
    const lastWeek = monthMatrix[monthMatrix.length - 1];
    const lastDay = lastWeek[lastWeek.length - 1].date;
    return {
      startDateStr: format(firstDay, 'yyyy-MM-dd'),
      endDateStr: format(lastDay, 'yyyy-MM-dd'),
    };
  }, [view, currentDate]);

  // Dynamic SWR Fetching
  const apiUrl = `/api/timeblocks?startDate=${startDateStr}&endDate=${endDateStr}`;
  const {
    data: timeBlocks = [],
    error: fetchError,
    isLoading,
    mutate: mutateBlocks,
  } = useSWR<TimeBlockData[]>(apiUrl, fetcher, {
    revalidateOnFocus: true,
  });

  // Navigation handlers
  const handlePrev = () => {
    if (view === 'day') handleDateChange(subDays(currentDate, 1));
    else if (view === 'week') handleDateChange(subWeeks(currentDate, 1));
    else handleDateChange(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'day') handleDateChange(addDays(currentDate, 1));
    else if (view === 'week') handleDateChange(addWeeks(currentDate, 1));
    else handleDateChange(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    handleDateChange(new Date());
  };

  // Open modal to create a block at a specific day and time
  const handleSlotClick = (date: Date, hour: number, minutes: number = 0) => {
    const startStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const nextHour = (hour + 1) % 24;
    const endStr = `${nextHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    setModalInitialBlock({
      date: format(date, 'yyyy-MM-dd'),
      startTime: startStr,
      endTime: endStr,
      color: CALENDAR_COLORS[0].hex,
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing block
  const handleBlockClick = (block: TimeBlockData, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalInitialBlock(block);
    setIsModalOpen(true);
  };

  // Save (Create or Update) handler
  const handleSaveBlock = async (blockData: {
    id?: string;
    title: string;
    description?: string;
    color: string;
    date: string;
    startTime: string;
    endTime: string;
    taskId?: string;
    taskInstanceId?: string;
  }) => {
    const isEdit = Boolean(blockData.id);
    const url = isEdit ? `/api/timeblocks/${blockData.id}` : '/api/timeblocks';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blockData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save time block.');
    }

    await mutateBlocks();
  };

  // Delete handler
  const handleDeleteBlock = async (id: string) => {
    const res = await fetch(`/api/timeblocks/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete time block.');
    }

    await mutateBlocks();
  };

  // Group blocks by date string (YYYY-MM-DD)
  const blocksByDate = useMemo(() => {
    const map = new Map<string, TimeBlockData[]>();
    timeBlocks.forEach((b) => {
      try {
        const dStr = format(new Date(b.date), 'yyyy-MM-dd');
        const list = map.get(dStr) || [];
        list.push(b);
        map.set(dStr, list);
      } catch {
        // ignore malformed date
      }
    });
    return map;
  }, [timeBlocks]);

  // Hours array 0..23
  const hours = useMemo(() => Array.from({ length: HOURS_COUNT }, (_, i) => i), []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-white select-none">
      {/* Top Calendar Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        {/* Left: Branding & Navigation controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] text-xs font-semibold hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              Today
            </button>

            <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
              <button
                onClick={handlePrev}
                title="Previous"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                title="Next"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white pl-2">
            {formatDateHeading(view, currentDate)}
          </h2>

          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-[#00C2CB] ml-2" />
          )}
        </div>

        {/* Right: View Switcher & Create Block CTA */}
        <div className="flex items-center gap-2.5">
          {/* View Switcher Tabs */}
          <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                view === 'day'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                view === 'week'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                view === 'month'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Month
            </button>
          </div>

          <button
            onClick={() => {
              setModalInitialBlock({
                date: format(currentDate, 'yyyy-MM-dd'),
                startTime: '09:00',
                endTime: '10:00',
                color: CALENDAR_COLORS[0].hex,
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] hover:bg-white text-[#0A0A0A] px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Schedule Block</span>
            <span className="sm:hidden">Block</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {fetchError && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>Failed to load schedule from database: {fetchError.message}</span>
          </div>
          <button
            onClick={() => mutateBlocks()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Calendar Viewport */}
      <div className="rounded-2xl border border-white/10 bg-[#0E0E0E] shadow-2xl overflow-hidden">
        {/* VIEW 1: DAY VIEW */}
        {view === 'day' && (
          <DayView
            date={currentDate}
            timeBlocks={blocksByDate.get(format(currentDate, 'yyyy-MM-dd')) || []}
            hours={hours}
            currentTimeMinutes={currentTimeMinutes}
            onSlotClick={(hour) => handleSlotClick(currentDate, hour)}
            onBlockClick={handleBlockClick}
            scrollRef={timelineScrollRef}
          />
        )}

        {/* VIEW 2: WEEK VIEW */}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            weekDates={getWeekDates(currentDate)}
            blocksByDate={blocksByDate}
            hours={hours}
            currentTimeMinutes={currentTimeMinutes}
            onSlotClick={handleSlotClick}
            onBlockClick={handleBlockClick}
            scrollRef={timelineScrollRef}
          />
        )}

        {/* VIEW 3: MONTH VIEW */}
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            monthMatrix={getMonthMatrix(currentDate)}
            blocksByDate={blocksByDate}
            onSelectDate={(d) => {
              handleDateChange(d);
              setView('day');
            }}
            onBlockClick={handleBlockClick}
            onAddBlock={(d) => {
              setModalInitialBlock({
                date: format(d, 'yyyy-MM-dd'),
                startTime: '09:00',
                endTime: '10:00',
                color: CALENDAR_COLORS[0].hex,
              });
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Empty State Banner if no blocks in active range */}
      {!isLoading && timeBlocks.length === 0 && !fetchError && (
        <div className="p-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-center text-xs text-white/40">
          No scheduled time blocks for this range. Click any time slot or &ldquo;Schedule Block&rdquo; to plan your focus time.
        </div>
      )}

      {/* CRUD Modal */}
      <TimeBlockModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalInitialBlock(null);
        }}
        initialBlock={modalInitialBlock}
        tasks={tasks}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* DAY VIEW COMPONENT                                                         */
/* -------------------------------------------------------------------------- */
interface DayViewProps {
  date: Date;
  timeBlocks: TimeBlockData[];
  hours: number[];
  currentTimeMinutes: number;
  onSlotClick: (hour: number) => void;
  onBlockClick: (block: TimeBlockData, e: React.MouseEvent) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  timeBlocks,
  hours,
  currentTimeMinutes,
  onSlotClick,
  onBlockClick,
  scrollRef,
}) => {
  const isViewingToday = dateFnsIsToday(date);
  const positionedBlocks = useMemo(
    () => layoutDayBlocks(timeBlocks, 0, PIXELS_PER_HOUR),
    [timeBlocks]
  );

  return (
    <div className="flex flex-col h-[700px]">
      {/* Day Header */}
      <div className="flex items-center border-b border-white/10 py-3 px-4 bg-white/[0.02]">
        <div className="w-16 shrink-0 text-center" />
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ${
              isViewingToday
                ? 'bg-[#00C2CB] text-[#0A0A0A]'
                : 'bg-white/10 text-white'
            }`}
          >
            {format(date, 'd')}
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {format(date, 'EEEE')}
            </div>
            <div className="text-[11px] text-white/50">
              {timeBlocks.length} scheduled {timeBlocks.length === 1 ? 'activity' : 'activities'}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <div
          className="relative min-w-full"
          style={{ height: `${HOURS_COUNT * PIXELS_PER_HOUR}px` }}
        >
          {/* Current time red line */}
          {isViewingToday && (
            <div
              className="absolute left-16 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: `${(currentTimeMinutes / 60) * PIXELS_PER_HOUR}px` }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF4FA3] -ml-1.5 shadow-sm" />
              <div className="flex-1 border-t-2 border-[#FF4FA3]" />
            </div>
          )}

          {/* Hourly Grid Rows */}
          {hours.map((hour) => {
            const topPx = hour * PIXELS_PER_HOUR;
            const hourLabel =
              hour === 0
                ? '12 AM'
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? '12 PM'
                : `${hour - 12} PM`;

            return (
              <div
                key={hour}
                style={{ top: `${topPx}px`, height: `${PIXELS_PER_HOUR}px` }}
                className="absolute left-0 right-0 border-t border-white/[0.07] flex group"
              >
                {/* Time Label on Left */}
                <div className="w-16 shrink-0 text-right pr-3 -mt-2.5 text-[11px] font-mono text-white/40 select-none">
                  {hour > 0 && hourLabel}
                </div>

                {/* Clickable Slot Area */}
                <div
                  onClick={() => onSlotClick(hour)}
                  className="flex-1 h-full cursor-pointer hover:bg-white/[0.025] transition-colors relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 top-1 text-[10px] text-white/25">
                    + Schedule {hourLabel}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Positioned Time Blocks */}
          <div className="absolute left-16 right-2 top-0 bottom-0 pointer-events-none">
            {positionedBlocks.map(({ block, top, height, leftPercent, widthPercent }) => (
              <div
                key={block.id}
                onClick={(e) => onBlockClick(block, e)}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: block.color || '#3B82F6',
                }}
                className="absolute rounded-xl p-2 shadow-md border border-white/20 text-white cursor-pointer hover:ring-2 hover:ring-white transition-all overflow-hidden flex flex-col justify-start pointer-events-auto group z-10"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold truncate leading-tight drop-shadow-xs">
                    {block.title}
                  </span>
                  <span className="text-[10px] opacity-80 shrink-0 font-mono">
                    {block.startTime}
                  </span>
                </div>

                {height >= 40 && (
                  <div className="text-[10px] opacity-90 truncate mt-0.5">
                    {formatTime12(block.startTime)} – {formatTime12(block.endTime)}
                    {block.task?.goal?.name && ` · ${block.task.goal.name}`}
                  </div>
                )}

                {height >= 60 && block.description && (
                  <p className="text-[10px] opacity-75 line-clamp-2 mt-1">
                    {block.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* WEEK VIEW COMPONENT                                                        */
/* -------------------------------------------------------------------------- */
interface WeekViewProps {
  currentDate: Date;
  weekDates: Date[];
  blocksByDate: Map<string, TimeBlockData[]>;
  hours: number[];
  currentTimeMinutes: number;
  onSlotClick: (date: Date, hour: number) => void;
  onBlockClick: (block: TimeBlockData, e: React.MouseEvent) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  weekDates,
  blocksByDate,
  hours,
  currentTimeMinutes,
  onSlotClick,
  onBlockClick,
  scrollRef,
}) => {
  return (
    <div className="flex flex-col h-[720px]">
      {/* 7-Day Header */}
      <div className="flex border-b border-white/10 bg-white/[0.02] sticky top-0 z-30">
        {/* Time column spacer */}
        <div className="w-14 sm:w-16 shrink-0 border-r border-white/10 text-center py-2 text-[10px] font-mono text-white/30">
          GMT
        </div>

        {/* 7 Days Columns Headers */}
        <div className="grid grid-cols-7 flex-1 divide-x divide-white/10">
          {weekDates.map((day) => {
            const isToday = dateFnsIsToday(day);
            const isSelected = isSameDay(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={`py-2.5 text-center transition-colors ${
                  isToday ? 'bg-[#00C2CB]/10' : ''
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                  {format(day, 'EEE')}
                </div>
                <div className="mt-1 flex justify-center">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isToday
                        ? 'bg-[#00C2CB] text-[#0A0A0A] shadow-xs'
                        : isSelected
                        ? 'bg-white text-black'
                        : 'text-white'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <div
          className="relative min-w-full flex"
          style={{ height: `${HOURS_COUNT * PIXELS_PER_HOUR}px` }}
        >
          {/* Left Time Labels */}
          <div className="w-14 sm:w-16 shrink-0 border-r border-white/10 relative select-none">
            {hours.map((hour) => {
              const topPx = hour * PIXELS_PER_HOUR;
              const hourLabel =
                hour === 0
                  ? ''
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? '12 PM'
                  : `${hour - 12} PM`;

              return (
                <div
                  key={hour}
                  style={{ top: `${topPx}px` }}
                  className="absolute left-0 right-0 pr-2 -mt-2 text-right text-[10px] font-mono text-white/40"
                >
                  {hourLabel}
                </div>
              );
            })}
          </div>

          {/* 7 Columns Timeline */}
          <div className="grid grid-cols-7 flex-1 divide-x divide-white/10 relative">
            {/* Horizontal row background lines across all 7 columns */}
            {hours.map((hour) => (
              <div
                key={hour}
                style={{ top: `${hour * PIXELS_PER_HOUR}px` }}
                className="absolute left-0 right-0 border-t border-white/[0.06] pointer-events-none"
              />
            ))}

            {/* Individual Day Columns */}
            {weekDates.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayBlocks = blocksByDate.get(dateStr) || [];
              const isToday = dateFnsIsToday(day);
              const positioned = layoutDayBlocks(dayBlocks, 0, PIXELS_PER_HOUR);

              return (
                <div key={dateStr} className="relative h-full">
                  {/* Current Time Line if this is today */}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: `${(currentTimeMinutes / 60) * PIXELS_PER_HOUR}px` }}
                    >
                      <div className="h-2 w-2 rounded-full bg-[#FF4FA3] -ml-1" />
                      <div className="flex-1 border-t-2 border-[#FF4FA3]" />
                    </div>
                  )}

                  {/* Hourly click targets */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      onClick={() => onSlotClick(day, hour)}
                      style={{
                        top: `${hour * PIXELS_PER_HOUR}px`,
                        height: `${PIXELS_PER_HOUR}px`,
                      }}
                      className="absolute left-0 right-0 cursor-pointer hover:bg-white/[0.035] transition-colors group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1 top-1 text-[9px] text-white/20">
                        +
                      </span>
                    </div>
                  ))}

                  {/* Day's Time Blocks */}
                  <div className="absolute inset-0 pointer-events-none p-0.5">
                    {positioned.map(({ block, top, height, leftPercent, widthPercent }) => (
                      <div
                        key={block.id}
                        onClick={(e) => onBlockClick(block, e)}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          backgroundColor: block.color || '#3B82F6',
                        }}
                        className="absolute rounded-lg p-1.5 shadow-sm border border-white/20 text-white cursor-pointer hover:ring-2 hover:ring-white transition-all overflow-hidden flex flex-col justify-start pointer-events-auto z-10"
                      >
                        <div className="flex items-center justify-between gap-1 leading-tight">
                          <span className="text-[11px] font-bold truncate">
                            {block.title}
                          </span>
                        </div>

                        {height >= 38 && (
                          <span className="text-[9px] opacity-85 truncate mt-0.5 font-mono">
                            {block.startTime} – {block.endTime}
                          </span>
                        )}

                        {height >= 60 && block.task?.goal?.name && (
                          <span className="text-[9px] opacity-75 truncate">
                            {block.task.goal.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MONTH VIEW COMPONENT                                                       */
/* -------------------------------------------------------------------------- */
interface MonthViewProps {
  currentDate: Date;
  monthMatrix: any[][];
  blocksByDate: Map<string, TimeBlockData[]>;
  onSelectDate: (d: Date) => void;
  onBlockClick: (block: TimeBlockData, e: React.MouseEvent) => void;
  onAddBlock: (d: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  monthMatrix,
  blocksByDate,
  onSelectDate,
  onBlockClick,
  onAddBlock,
}) => {
  const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col">
      {/* Month Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02] text-center py-2.5">
        {weekDayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-[11px] font-mono uppercase tracking-wider text-white/50"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Month Calendar Grid */}
      <div className="divide-y divide-white/10">
        {monthMatrix.map((week, weekIdx) => (
          <div
            key={weekIdx}
            className="grid grid-cols-7 divide-x divide-white/10 min-h-[110px]"
          >
            {week.map((cell: any) => {
              const dayBlocks = blocksByDate.get(cell.dateStr) || [];
              const isToday = cell.isToday;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => onSelectDate(cell.date)}
                  className={`p-2 transition-colors cursor-pointer group flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? 'bg-transparent hover:bg-white/[0.025]'
                      : 'bg-white/[0.01] opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Date Number and Add action */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-[#00C2CB] text-[#0A0A0A] font-bold shadow-xs'
                          : 'text-white/70'
                      }`}
                    >
                      {format(cell.date, 'd')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddBlock(cell.date);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-opacity"
                      title={`Schedule activity on ${cell.dateStr}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Chips for Day's Blocks */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayBlocks.slice(0, 3).map((block) => (
                      <div
                        key={block.id}
                        onClick={(e) => onBlockClick(block, e)}
                        style={{
                          backgroundColor: `${block.color || '#3B82F6'}22`,
                          borderColor: `${block.color || '#3B82F6'}77`,
                        }}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] text-white truncate hover:brightness-125 transition-all shadow-2xs"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: block.color || '#3B82F6' }}
                        />
                        <span className="font-mono text-[9px] text-white/60 shrink-0">
                          {block.startTime}
                        </span>
                        <span className="truncate font-medium">{block.title}</span>
                      </div>
                    ))}

                    {dayBlocks.length > 3 && (
                      <div className="text-[10px] text-white/40 pl-1 font-mono">
                        +{dayBlocks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
