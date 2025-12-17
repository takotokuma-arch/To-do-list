import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

type TimerMode = 'focus' | 'break';

interface PomodoroTimerProps {
    onClose?: () => void;
    className?: string;
}

export function PomodoroTimer({ onClose, className }: PomodoroTimerProps) {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    const resetTimer = useCallback((newMode: TimerMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            // Optional: Play sound or notification here
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 p-4 bg-white rounded-2xl shadow-xl border border-stone-100 w-48 transition-all hover:scale-105",
            className
        )}>
            <div className="flex w-full justify-between items-center mb-2">
                <span className={cn(
                    "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1",
                    mode === 'focus' ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-600"
                )}>
                    {mode === 'focus' ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                    {mode === 'focus' ? 'Focus' : 'Break'}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => resetTimer(mode)}
                        className="text-stone-400 hover:text-stone-600 transition-colors p-1"
                        title="Reset Timer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
                            title="Close Timer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="text-4xl font-mono font-bold text-stone-800 tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
            </div>

            <div className="flex gap-2 w-full mt-2">
                <Button
                    onClick={toggleTimer}
                    className={cn(
                        "flex-1 h-9",
                        mode === 'focus' ? "bg-rose-500 hover:bg-rose-600" : "bg-teal-500 hover:bg-teal-600"
                    )}
                >
                    {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                </Button>
            </div>

            <div className="flex gap-1 w-full mt-1 border-t border-stone-100 pt-2">
                <button
                    onClick={() => resetTimer('focus')}
                    className={cn(
                        "flex-1 text-[10px] py-1 rounded font-medium transition-colors",
                        mode === 'focus' ? "bg-stone-100 text-stone-900" : "text-stone-400 hover:bg-stone-50"
                    )}
                >
                    25m
                </button>
                <button
                    onClick={() => resetTimer('break')}
                    className={cn(
                        "flex-1 text-[10px] py-1 rounded font-medium transition-colors",
                        mode === 'break' ? "bg-stone-100 text-stone-900" : "text-stone-400 hover:bg-stone-50"
                    )}
                >
                    5m
                </button>
            </div>
        </div>
    );
}
