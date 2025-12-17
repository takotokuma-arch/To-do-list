import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Trash2 } from 'lucide-react';
import { type Task } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    onDelete: (id: string) => void;
    onClick?: (task: Task) => void;
}

export function TaskCard({ task, onDelete, onClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl h-[100px] w-full"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            className={cn(
                "bg-white p-4 rounded-xl shadow-card hover:shadow-float transition-shadow cursor-grab active:cursor-grabbing group relative border border-transparent hover:border-stone-100",
                "flex flex-col gap-2"
            )}
        >
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-stone-800 break-words leading-tight">{task.title}</h3>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-red-500 rounded bg-stone-50"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {task.description && (
                <p className="text-sm text-stone-500 line-clamp-2">{task.description}</p>
            )}

            {task.deadline && (
                <div className="mt-2 flex items-center gap-1 text-xs text-stone-400">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(task.deadline), 'MMM d, HH:mm')}</span>
                </div>
            )}
        </div>
    );
}
