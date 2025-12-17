import { useState } from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Flag, CheckCircle } from 'lucide-react';
import { type Task, type Tag } from '../types';
import { cn } from '../lib/utils';

interface CalendarViewProps {
    tasks: Task[];
    tags: Tag[];
    onTaskClick: (task: Task) => void;
}

export function CalendarView({ tasks, tags, onTaskClick }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));

    const totalDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weeks = [];
    let week = [];
    for (let day of totalDays) {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-stone-800">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center bg-stone-100 rounded-lg p-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md transition-colors text-stone-600">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={goToToday} className="px-3 py-1 text-xs font-medium hover:bg-white rounded-md transition-colors text-stone-600">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md transition-colors text-stone-600">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-rows-5 md:grid-rows-auto">
                {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="grid grid-cols-7 border-b border-stone-200 last:border-0 min-h-[120px]">
                        {week.map((day, dIndex) => {
                            const isCurrentHeaderMonth = isSameMonth(day, currentMonth);
                            const isCurrentDay = isToday(day);

                            // Find tasks for this day
                            const dayTasks = tasks.filter(task =>
                                task.deadline && isSameDay(new Date(task.deadline), day)
                            );

                            return (
                                <div
                                    key={dIndex}
                                    className={cn(
                                        "border-r border-stone-200 last:border-0 p-2 relative flex flex-col gap-1 transition-colors",
                                        !isCurrentHeaderMonth && "bg-stone-50/50",
                                        isCurrentDay && "bg-amber-50/30"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                            isCurrentDay
                                                ? "bg-amber-500 text-white shadow-sm"
                                                : isCurrentHeaderMonth ? "text-stone-700" : "text-stone-400"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] text-stone-400 font-medium">
                                                {dayTasks.length} tasks
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] no-scrollbar">
                                        {dayTasks.map(task => {
                                            const taskTag = tags.find(t => t.id === task.tagId);
                                            return (
                                                <button
                                                    key={task.id}
                                                    onClick={() => onTaskClick(task)}
                                                    className={cn(
                                                        "text-left p-1.5 rounded-md text-xs border transition-all hover:shadow-sm group",
                                                        task.status === 'done'
                                                            ? "bg-stone-100 border-stone-200 text-stone-400 opacity-60 line-through"
                                                            : "bg-white border-stone-200 hover:border-amber-300 text-stone-700"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        {task.priority === 'high' && <Flag className="w-2.5 h-2.5 text-red-500 fill-current" />}
                                                        <span className="truncate font-medium">{task.title}</span>
                                                    </div>
                                                    {taskTag && (
                                                        <div className="flex items-center gap-1">
                                                            <div
                                                                className="w-1.5 h-1.5 rounded-full"
                                                                style={{ backgroundColor: taskTag.color }}
                                                            />
                                                            <span className="truncate text-[10px] text-stone-500">{taskTag.name}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
