import {
    DndContext,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { type ColumnType, type Task, type Tag } from '../types';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';

interface BoardProps {
    tasks: Task[];
    tags: Tag[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>; // Allow Board to update state directly for DnD
    onDeleteTask: (id: string) => void;
    onTaskDoubleClick?: (task: Task) => void;
    onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export function Board({ tasks, tags, setTasks, onDeleteTask, onTaskDoubleClick, onToggleSubtask }: BoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const columns: ColumnType[] = useMemo(
        () => [
            { id: 'todo', title: 'Not Started' },
            { id: 'in-progress', title: 'In Progress' },
            { id: 'done', title: 'Done' },
        ],
        []
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // Prevent accidental drags
            },
        })
    );

    const tasksByColumn = useMemo(() => {
        const todo = tasks.filter((t) => t.status === 'todo');
        const inProgress = tasks.filter((t) => t.status === 'in-progress');
        const done = tasks.filter((t) => t.status === 'done');
        // Sort logic can be added here if we save order index. For now relying on array order.
        return { todo, 'in-progress': inProgress, done };
    }, [tasks]);

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    // Different column
                    const newTasks = [...tasks];
                    newTasks[activeIndex].status = tasks[overIndex].status;
                    return arrayMove(newTasks, activeIndex, overIndex - 1); // Insert before?
                    // arrayMove just swaps indices. Simpler: map status then resort?
                    // dnd-kit example code is complex for mixed sorting + transfer.
                    // Simplification: Update status immediately.
                }

                // Same column reordering
                return arrayMove(tasks, activeIndex, overIndex);
            });
        }



        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const newStatus = overId as any; // overId is column id

                if (tasks[activeIndex].status !== newStatus) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = { ...newTasks[activeIndex], status: newStatus };

                    // Trigger confetti if moving to Done
                    if (newStatus === 'done') {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }

                    return arrayMove(newTasks, activeIndex, activeIndex); // Just status update
                }
                return tasks;
            });
        }
    };

    const onDragEnd = () => {
        setActiveTask(null);

        // Final reorder logic if needed, but onDragOver usually handles visual updates.
        // We are good relying on onDragOver for state updates in this simple version.
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex gap-6 h-full pb-4 overflow-x-auto items-start">
                {columns.map((col) => (
                    <Column
                        key={col.id}
                        column={col}
                        tasks={tasksByColumn[col.id as keyof typeof tasksByColumn]}
                        tags={tags}

                        onDelete={onDeleteTask}
                        onTaskClick={onTaskDoubleClick}
                        onToggleSubtask={onToggleSubtask}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeTask && (
                        <TaskCard
                            task={activeTask}
                            tags={tags}
                            onDelete={onDeleteTask}
                        />
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
