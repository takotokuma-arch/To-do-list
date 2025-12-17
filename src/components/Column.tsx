import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useMemo } from 'react';
import { type ColumnType, type Task, type Tag } from '../types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
    column: ColumnType;
    tasks: Task[];
    tags: Tag[];
    onDelete: (id: string) => void;
    onTaskClick?: (task: Task) => void;
    onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export function Column({ column, tasks, tags, onDelete, onTaskClick, onToggleSubtask }: ColumnProps) {
    const tasksIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
        disabled: true, // Columns themselves are not sortable in this version, only tasks within them
    });

    return (
        <div
            ref={setNodeRef}
            className="bg-stone-50 w-80 shrink-0 rounded-2xl p-4 flex flex-col gap-4 h-full max-h-full border border-stone-200/50"
        >
            <div className="flex items-center justify-between px-2">
                <h2 className="font-bold text-stone-700">{column.title}</h2>
                <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded-full font-medium">
                    {tasks.length}
                </span>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[100px] px-1 pb-2">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            tags={tags}
                            onDelete={onDelete}
                            onDoubleClick={onTaskClick}
                            onToggleSubtask={onToggleSubtask}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
