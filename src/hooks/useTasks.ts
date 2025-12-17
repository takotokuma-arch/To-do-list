import { useState, useEffect } from 'react';
import { type Task, type TaskStatus, type Tag, type TaskPriority, type Subtask, type RepeatFrequency } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks } from 'date-fns';

const STORAGE_KEY = 'kanban-tasks';
const TAGS_STORAGE_KEY = 'kanban-tags';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to parse tasks from local storage", error);
            return [];
        }
    });

    const [tags, setTags] = useState<Tag[]>(() => {
        try {
            const saved = localStorage.getItem(TAGS_STORAGE_KEY);
            if (!saved) {
                return [
                    { id: '1', name: 'University', color: '#3b82f6' },
                    { id: '2', name: 'Circle', color: '#f97316' },
                    { id: '3', name: 'Others', color: '#78716c' },
                ];
            }
            return JSON.parse(saved);
        } catch (error) {
            console.error("Failed to parse tags from local storage", error);
            return [
                { id: '1', name: 'University', color: '#3b82f6' },
                { id: '2', name: 'Circle', color: '#f97316' },
                { id: '3', name: 'Others', color: '#78716c' },
            ];
        }
    });

    // Undo State
    const [recentlyDeleted, setRecentlyDeleted] = useState<Task | null>(null);
    const [showUndoToast, setShowUndoToast] = useState(false);
    const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    }, [tags]);

    const addTask = (title: string, description: string, deadline: string, status: TaskStatus, tagId?: string, priority: TaskPriority = 'medium', subtasks: Subtask[] = [], repeat: RepeatFrequency = 'none') => {
        const newTask: Task = {
            id: uuidv4(),
            title,
            description,
            deadline: deadline ? new Date(deadline).toISOString() : undefined,
            status,
            tagId,
            priority,
            subtasks,
            createdAt: Date.now(),
            repeat,
        };
        setTasks((prev) => [...prev, newTask]);
    };

    const handleTaskCompletion = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.repeat || task.repeat === 'none') return;

        let nextDate: Date;
        const currentDeadline = task.deadline ? new Date(task.deadline) : new Date();

        switch (task.repeat) {
            case 'daily':
                nextDate = addDays(currentDeadline, 1);
                break;
            case 'weekly':
                nextDate = addWeeks(currentDeadline, 1);
                break;
            case 'weekdays':
                // If Fri, Sat, Sun -> Next Monday
                // Else -> Next Day
                // Simplification for reliability:
                // If it's Friday, +3 days (Mon)
                // If Sat, +2 (Mon)
                // If Sun, +1 (Mon)
                // Else +1
                const day = currentDeadline.getDay();
                if (day === 5) nextDate = addDays(currentDeadline, 3);
                else if (day === 6) nextDate = addDays(currentDeadline, 2);
                else if (day === 0) nextDate = addDays(currentDeadline, 1);
                else nextDate = addDays(currentDeadline, 1);
                break;
            default:
                return;
        }

        const newTask: Task = {
            ...task,
            id: uuidv4(),
            status: 'todo',
            deadline: nextDate.toISOString(),
            createdAt: Date.now(),
            // Keep the same repeat setting for the new task so it continues repeating
            repeat: task.repeat,
            // Reset subtasks? Usually yes for a new instance.
            subtasks: task.subtasks.map(st => ({ ...st, completed: false })),
            isArchived: false,
        };

        setTasks(prev => [...prev, newTask]);
    };

    const addTag = (name: string, color: string) => {
        const newTag: Tag = { id: uuidv4(), name, color };
        setTags(prev => [...prev, newTag]);
    };

    const deleteTag = (id: string) => {
        setTasks(prev => prev.map(task => task.tagId === id ? { ...task, tagId: undefined } : task));
        setTags(prev => prev.filter(t => t.id !== id));
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    };

    const toggleSubtask = (taskId: string, subtaskId: string) => {
        setTasks(prev => prev.map(task => {
            if (task.id !== taskId) return task;
            return {
                ...task,
                subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
            };
        }));
    };

    const deleteTask = (id: string) => {
        const taskToDelete = tasks.find(t => t.id === id);
        if (taskToDelete) {
            setRecentlyDeleted(taskToDelete);
            setShowUndoToast(true);

            // Clear previous timer if exists
            if (undoTimer) clearTimeout(undoTimer);

            // Auto hide toast after 5 seconds
            const timer = setTimeout(() => {
                setShowUndoToast(false);
                setRecentlyDeleted(null);
            }, 5000);
            setUndoTimer(timer);
        }
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const restoreDeletedTask = () => {
        if (recentlyDeleted) {
            setTasks(prev => [...prev, recentlyDeleted]);
            setRecentlyDeleted(null);
            setShowUndoToast(false);
            if (undoTimer) clearTimeout(undoTimer);
        }
    };

    const closeUndoToast = () => {
        setShowUndoToast(false);
        // Don't clear recentlyDeleted immediately if we want to be safe, but typically closing toast means opportunity lost.
        // Actually, let's keep it null to free memory or if logic requires.
        // For UI, if toast is closed manually, we usually consider the undo window closed.
        setRecentlyDeleted(null);
        if (undoTimer) clearTimeout(undoTimer);
    };

    const moveTask = (taskId: string, newStatus: TaskStatus) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
    };

    const archiveDoneTasks = () => {
        setTasks(prev => prev.map(t => t.status === 'done' ? { ...t, isArchived: true } : t));
    };

    const archiveTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
    };

    const restoreArchivedTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t));
    };

    const deleteTaskForever = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    return {
        tasks,
        setTasks, // Exposed for dnd-kit reordering
        tags,
        addTag,
        deleteTag,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        toggleSubtask,
        showUndoToast,
        restoreDeletedTask,
        closeUndoToast,
        archiveDoneTasks,
        archiveTask,
        restoreArchivedTask,
        deleteTaskForever,
        handleTaskCompletion
    };
}

