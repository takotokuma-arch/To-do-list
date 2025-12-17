export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    deadline?: string; // ISO string
    status: TaskStatus;
    createdAt: number;
}

export type ColumnType = {
    id: TaskStatus;
    title: string;
};
