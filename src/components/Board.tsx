import {
    DndContext,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { type ColumnType, type Task, type Tag, type TaskStatus } from '../types';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { Archive } from 'lucide-react';

interface BoardProps {
    tasks: Task[];
    tags: Tag[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onDeleteTask: (id: string) => void;
    onTaskDoubleClick: (task: Task) => void;
    onToggleSubtask: (taskId: string, subtaskId: string) => void;
    onArchiveDone?: () => void;
    onArchiveTask?: (id: string) => void;
    onTaskComplete?: (id: string) => void;
}

const COLUMNS: ColumnType[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];

export function Board({ tasks, tags, setTasks, onDeleteTask, onTaskDoubleClick, onToggleSubtask, onArchiveDone, onArchiveTask, onTaskComplete }: BoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    const activeTask = useMemo(() => tasks.find((t) => t.id === activeId), [activeId, tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const currentActiveId = active.id as string;
        const currentOverId = over.id as string;

        if (currentActiveId === currentOverId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveTask) return;

        // Dropping a Task over another Task (potentially in different column)
        if (isActiveTask && isOverTask) {
            const activeIndex = tasks.findIndex((t) => t.id === currentActiveId);
            const overIndex = tasks.findIndex((t) => t.id === currentOverId);

            if (tasks[activeIndex].status !== tasks[overIndex].status) {
                const newStatus = tasks[overIndex].status;
                // Trigger confetti if moving to Done
                if (newStatus === 'done') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    // ADDED: Trigger task completion logic (create repeating task if needed)
                    // We only want to trigger this if we are authentically moving to done.
                    // Since DragOver fires continuously, this might trigger multiple times for the same task while dragging?
                    // No, because once we update the status (setTasks), the next DragOver event will see `tasks[activeIndex].status === tasks[overIndex].status` (both done),
                    // so it will fall through to line 92 (same column reordering, handled by DragEnd/sorting strategy mostly).
                    // The `if (tasks[activeIndex].status !== tasks[overIndex].status)` check PROTECTS us from double firing!
                    // Once we switch it to 'done', they are equal, so this block won't run again for this drag session.
                    if (onTaskComplete) {
                        onTaskComplete(currentActiveId);
                    }
                }

                setTasks((items) => {
                    const newItems = [...items];
                    newItems[activeIndex] = { ...newItems[activeIndex], status: newStatus };
                    return arrayMove(newItems, activeIndex, overIndex - 1); // Simple visual adjustment
                });
            }
            // Same column reordering is better handled in DragEnd for stability, 
            // but DragOver can handle column switching "preview".
        }

        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            const activeIndex = tasks.findIndex((t) => t.id === currentActiveId);
            const newStatus = currentOverId as TaskStatus;

            if (tasks[activeIndex].status !== newStatus) {
                // Trigger confetti if moving to Done
                if (newStatus === 'done') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    if (onTaskComplete) {
                        onTaskComplete(currentActiveId);
                    }
                }

                setTasks((items) => {
                    const newItems = [...items];
                    newItems[activeIndex] = { ...newItems[activeIndex], status: newStatus };
                    return arrayMove(newItems, activeIndex, activeIndex);
                });
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const currentActiveId = active.id as string;
        const currentOverId = over.id as string;

        const activeIndex = tasks.findIndex((t) => t.id === currentActiveId);
        const overIndex = tasks.findIndex((t) => t.id === currentOverId);

        // Check if moved to Done column
        // We know the status has been updated in handleDragOver if moving between columns.
        // But we need to check if the task IS in done status now, and WAS NOT before?
        // Actually, since handleDragOver updates state optimistically, the task in `tasks` array already has the new status.
        // We need to track where it came from.
        // Or simpler: We know the active item.
        // Wait, `active.data.current` might help if we set it?
        // Let's rely on the fact that handleDragOver does the status update.
        // WE CANNOT easily detect "change" here without extra state tracking.
        // ALTERNATIVE: Call onTaskComplete in handleDragOver when status changes to 'done'.
        // But handleDragOver fires multiple times.
        // Let's stick to handleDragOver but use a debounce or check?
        // NO, `onDragEnd` is best.
        // But state IS ALREADY UPDATED.
        // We can check if `tasks[activeIndex].status === 'done'` (which is the new status).
        // AND we somehow need to know if it wasn't done before.
        // `active.data.current?.sortable.containerId` might give the OLD container?
        // `active.data.current` usually holds the data we passed to `useDraggable` / `useSortable`.
        // Let's look at `TaskCard`'s useSortable. We pass `task` object usually.
        // If we didn't pass explicit data, we rely on id.

        // Let's assume onTaskComplete checks internally if it needs work (it does check repeat).
        // But we don't want to duplicate tasks if we move around WITHIN done.
        // So we need to filter: "Only if moved from NOT done to DONE".
        // `active.data.current?.sortable?.containerId` is the old container ID in @dnd-kit sortable?
        // Yes, `active.data.current.sortable.containerId` should be the source column ID.



        // This is getting complicated because of how we set SortableContext.
        // Let's simplify: in `handleDragOver`, we explicitly detected a status change.
        // We can call `onTaskComplete` there!
        // But we need to ensure we only call it ONCE per transition.
        // We can't easily guarantee that in DragOver.

        // Let's try to pass `onTaskComplete` to `handleDragOver` logic.
        // ...

        if (activeIndex !== overIndex) {
            setTasks((items) => arrayMove(items, activeIndex, overIndex));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
                {COLUMNS.map((column) => (
                    <Column
                        key={column.id}
                        column={column}
                        tasks={tasks.filter((task) => task.status === column.id)}
                        tags={tags}
                        headerAction={
                            column.id === 'done' && onArchiveDone ? (
                                <button
                                    onClick={onArchiveDone}
                                    className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors group"
                                    title="Archive all done tasks"
                                >
                                    <Archive className="w-4 h-4" />
                                </button>
                            ) : undefined
                        }
                    >
                        <SortableContext
                            items={tasks.filter((task) => task.status === column.id).map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {/* Task Cards rendered inside Column */}
                            {tasks.filter(t => t.status === column.id).map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    tags={tags}
                                    onDelete={onDeleteTask}
                                    onDoubleClick={() => onTaskDoubleClick(task)}
                                    onToggleSubtask={onToggleSubtask}
                                    onArchive={onArchiveTask}
                                />
                            ))}
                        </SortableContext>
                    </Column>
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeTask ? (
                        <TaskCard
                            task={activeTask}
                            tags={tags}
                            isOverlay
                            onDelete={onDeleteTask}
                            onToggleSubtask={onToggleSubtask}
                        />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
