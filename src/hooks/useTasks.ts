import { useState, useEffect } from 'react';
import { type Task, type TaskStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'kanban-tasks';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (title: string, description: string, deadline: string, status: TaskStatus) => {
        const newTask: Task = {
            id: uuidv4(),
            title,
            description,
            deadline: deadline ? new Date(deadline).toISOString() : undefined,
            status,
            createdAt: Date.now(),
        };
        setTasks((prev) => [...prev, newTask]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const moveTask = (taskId: string, newStatus: TaskStatus) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
    };

    return {
        tasks,
        setTasks, // Exposed for dnd-kit reordering
        addTask,
        updateTask,
        deleteTask,
        moveTask,
    };
}
