import { useState, useEffect } from 'react';
import { type Task, type TaskStatus, type Tag, type TaskPriority, type Subtask } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'kanban-tasks';
const TAGS_STORAGE_KEY = 'kanban-tags';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [tags, setTags] = useState<Tag[]>(() => {
        const saved = localStorage.getItem(TAGS_STORAGE_KEY);
        // Default tags if empty
        if (!saved) {
            return [
                { id: '1', name: 'University', color: '#3b82f6' },
                { id: '2', name: 'Circle', color: '#f97316' },
                { id: '3', name: 'Others', color: '#78716c' },
            ];
        }
        return JSON.parse(saved);
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

    const addTask = (title: string, description: string, deadline: string, status: TaskStatus, tagId?: string, priority: TaskPriority = 'medium', subtasks: Subtask[] = []) => {
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
        };
        setTasks((prev) => [...prev, newTask]);
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
        closeUndoToast
    };
}

