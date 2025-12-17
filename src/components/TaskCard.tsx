
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Clock, CheckCircle, Circle, Flag } from 'lucide-react';
import { type Task, type Tag } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    tags?: Tag[];
    onDelete: (id: string) => void;
    onClick?: (task: Task) => void;
    onDoubleClick?: (task: Task) => void;
    onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export function TaskCard({ task, tags = [], onDelete, onClick, onDoubleClick, onToggleSubtask }: TaskCardProps) {
    const taskTag = tags.find(t => t.id === task.tagId);
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
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick?.(task);
            }}
            className={cn(
                "bg-white p-4 rounded-xl shadow-card hover:shadow-float transition-shadow cursor-grab active:cursor-grabbing group relative border border-transparent hover:border-stone-100",
                "flex flex-col gap-2"
            )}
        >
            {/* Priority and Tags Row */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    {task.priority && (
                        <div className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                            task.priority === 'high' ? "bg-red-100 text-red-600" :
                                task.priority === 'medium' ? "bg-amber-100 text-amber-600" :
                                    "bg-green-100 text-green-600"
                        )}>
                            <Flag className="w-3 h-3 fill-current" />
                            {task.priority}
                        </div>
                    )}

                    {taskTag && (
                        <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                            style={{
                                backgroundColor: taskTag.color + '15',
                                color: taskTag.color,
                                borderColor: taskTag.color
                            }}
                        >
                            {taskTag.name}
                        </span>
                    )}
                </div>
            </div>

            <h3 className={cn("font-medium text-stone-800 leading-tight mb-1", task.status === 'done' && 'line-through text-stone-400')}>{task.title}</h3>

            {task.description && (
                <p className="text-sm text-stone-500 line-clamp-2 mb-2">{task.description}</p>
            )}

            {/* Subtasks Preview */}
            {task.subtasks && task.subtasks.length > 0 && (
                <div className="space-y-1 my-2 pl-1 border-l-2 border-stone-100">
                    {task.subtasks.map(st => (
                        <div key={st.id}
                            className="flex items-center gap-2 text-xs group cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSubtask?.(task.id, st.id);
                            }}
                        >
                            {st.completed ?
                                <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" /> :
                                <Circle className="w-3 h-3 text-stone-300 group-hover:text-stone-400 flex-shrink-0" />
                            }
                            <span className={cn("truncate", st.completed ? "text-stone-400 line-through" : "text-stone-600")}>
                                {st.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mt-auto">
                {task.deadline ? (
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(task.deadline), 'MMM d, HH:mm')}</span>
                    </div>
                ) : <div />}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-stone-400 hover:text-red-500 rounded hover:bg-red-50"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

