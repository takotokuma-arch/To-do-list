import { cn } from '../lib/utils';

interface ProgressBarProps {
    totalTasks: number;
    completedTasks: number;
}

export function ProgressBar({ totalTasks, completedTasks }: ProgressBarProps) {
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="w-full max-w-md mx-auto mt-2">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-semibold text-stone-500">Today's Progress</span>
                <span className="text-sm font-bold text-stone-800">{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden shadow-inner">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        percentage === 100 ? "bg-emerald-500" : "bg-stone-800"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
