import { useSortable } from '@dnd-kit/sortable';
import { type ColumnType, type Task, type Tag } from '../types';

interface ColumnProps {
    column: ColumnType;
    tasks: Task[]; // Kept for count badge
    tags: Tag[]; // Maybe not needed if children handle cards, but keeping for now if used elsewhere
    headerAction?: React.ReactNode;
    children?: React.ReactNode;
}

export function Column({ column, tasks, headerAction, children }: ColumnProps) {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
        disabled: true,
    });

    return (
        <div
            ref={setNodeRef}
            className="bg-stone-50 w-80 shrink-0 rounded-2xl p-4 flex flex-col gap-4 h-full max-h-full border border-stone-200/50"
        >
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <h2 className="font-bold text-stone-700">{column.title}</h2>
                    <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded-full font-medium">
                        {tasks.length}
                    </span>
                </div>
                {headerAction}
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[100px] px-1 pb-2">
                {children}
            </div>
        </div>
    );
}
