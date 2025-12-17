export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type RepeatFrequency = 'none' | 'daily' | 'weekly' | 'weekdays';

export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    deadline?: string; // ISO string
    status: TaskStatus;
    tagId?: string;
    priority: TaskPriority;
    subtasks: Subtask[];
    createdAt: number;
    createdAt: number;
    isArchived?: boolean;
    repeat?: 'none' | 'daily' | 'weekly' | 'weekdays';
}

export type ColumnType = {
    id: TaskStatus;
    title: string;
};
