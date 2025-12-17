import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { type TaskStatus } from '../types';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string, description: string, deadline: string, status: TaskStatus) => void;
    defaultStatus?: TaskStatus;
}

export function NewTaskModal({ isOpen, onClose, onAdd, defaultStatus = 'todo' }: NewTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onAdd(title, description, deadline, defaultStatus);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setDeadline('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-sm font-medium text-stone-700">Title</label>
                    <Input
                        id="title"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="description" className="text-sm font-medium text-stone-700">Description (Optional)</label>
                    <textarea
                        id="description"
                        className="flex min-h-[80px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="deadline" className="text-sm font-medium text-stone-700">Deadline (Optional)</label>
                    <Input
                        id="deadline"
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!title.trim()}>Add Task</Button>
                </div>
            </form>
        </Modal>
    );
}
