import React, { useState } from 'react';
import { format, addDays, nextSunday, addHours } from 'date-fns';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { X, Flag, CheckCircle, Circle, Trash2, Plus, Repeat } from 'lucide-react';
import { type TaskStatus, type Tag, type Task, type TaskPriority, type Subtask, type RepeatFrequency } from '../types';
import { cn } from '../lib/utils';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string, description: string, deadline: string, status: TaskStatus, tagId?: string, priority?: TaskPriority, subtasks?: Subtask[], repeat?: RepeatFrequency) => void;
    defaultStatus?: TaskStatus;
    initialData?: Task;
}

export function NewTaskModal({ isOpen, onClose, onAdd, defaultStatus = 'todo', tags, onAddTag, onDeleteTag, initialData }: NewTaskModalProps & { tags: Tag[], onAddTag: (name: string, color: string) => void, onDeleteTag: (id: string) => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [selectedTagId, setSelectedTagId] = useState<string | undefined>();
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [repeat, setRepeat] = useState<RepeatFrequency>('none');

    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3b82f6');
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    // Relative time state
    const [relativeHours, setRelativeHours] = useState(3);

    const handlePreset = (type: 'today' | 'tomorrow' | 'weekend') => {
        let targetDate = new Date();

        switch (type) {
            case 'today':
                targetDate = new Date();
                break;
            case 'tomorrow':
                targetDate = addDays(new Date(), 1);
                break;
            case 'weekend':
                // If today is Sunday, 'nextSunday' gives next week's Sunday. 
                // If we want "this coming weekend", generic logic:
                targetDate = nextSunday(new Date());
                break;
        }

        setDate(format(targetDate, 'yyyy-MM-dd'));
        setTime('23:59');
    };

    const handleRelativeTime = () => {
        const targetDate = addHours(new Date(), relativeHours);
        setDate(format(targetDate, 'yyyy-MM-dd'));
        setTime(format(targetDate, 'HH:mm'));
    };

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setDescription(initialData.description || '');
                if (initialData.deadline) {
                    const d = new Date(initialData.deadline);
                    setDate(format(d, 'yyyy-MM-dd'));
                    setTime(format(d, 'HH:mm'));
                } else {
                    setDate('');
                    setTime('');
                }
                setSelectedTagId(initialData.tagId);
                setPriority(initialData.priority || 'medium');
                setSubtasks(initialData.subtasks || []);
                setRepeat(initialData.repeat || 'none');
            } else {
                setTitle('');
                setDescription('');
                setDate('');
                setTime('');
                setSelectedTagId(undefined);
                setPriority('medium');
                setSubtasks([]);
                setRepeat('none');
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        let finalDeadline = '';
        if (date) {
            const timeToUse = time || '23:59';
            finalDeadline = `${date}T${timeToUse}`;
        }

        onAdd(title, description, finalDeadline, defaultStatus, selectedTagId, priority, subtasks, repeat);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setSelectedTagId(undefined);
        setPriority('medium');
        setSubtasks([]);
        setRepeat('none');
    };

    const handleAddTag = () => {
        if (!newTagName.trim()) return;
        onAddTag(newTagName, newTagColor);
        setNewTagName('');
        setIsAddingTag(false);
    };

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return;
        setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtaskTitle, completed: false }]);
        setNewSubtaskTitle('');
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Task" : "Add New Task"}>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        // Allow Enter in textarea
                        if (e.target instanceof HTMLTextAreaElement) return;

                        // Prevent default form submission
                        e.preventDefault();

                        // Check for double enter (within 500ms)
                        const now = Date.now();
                        const last = (e.currentTarget as any)._lastEnter || 0;
                        if (now - last < 500) {
                            handleSubmit(e);
                        }
                        (e.currentTarget as any)._lastEnter = now;
                    }
                }}
            >
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
                    <label className="text-sm font-medium text-stone-700">Priority</label>
                    <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border",
                                    priority === p
                                        ? "ring-2 ring-offset-1 ring-stone-400 border-transparent"
                                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                                )}
                                style={priority === p ? {
                                    backgroundColor: p === 'high' ? '#fee2e2' : p === 'medium' ? '#fef3c7' : '#dcfce7',
                                    color: p === 'high' ? '#dc2626' : p === 'medium' ? '#d97706' : '#16a34a',
                                } : {}}
                            >
                                <Flag className={cn("w-3.5 h-3.5", p === 'high' ? "fill-red-500" : p === 'medium' ? "fill-amber-500" : "fill-green-500")} />
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-stone-700">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <div key={tag.id} className="relative group">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTagId(selectedTagId === tag.id ? undefined : tag.id)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-semibold transition-all border",
                                        selectedTagId === tag.id
                                            ? "ring-2 ring-offset-1 ring-stone-400"
                                            : "opacity-70 hover:opacity-100"
                                    )}
                                    style={{
                                        backgroundColor: tag.color + '20', // 20% opacity background
                                        color: tag.color,
                                        borderColor: tag.color
                                    }}
                                >
                                    {tag.name}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTag(tag.id);
                                        if (selectedTagId === tag.id) setSelectedTagId(undefined);
                                    }}
                                    className="absolute -top-1 -right-1 bg-white border border-stone-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-stone-50 text-stone-400 hover:text-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsAddingTag(!isAddingTag)}
                            className="px-3 py-1 rounded-full text-xs font-semibold border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50"
                        >
                            + New Tag
                        </button>
                    </div>

                    {isAddingTag && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-stone-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <Input
                                placeholder="Tag Name"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                className="h-8 text-xs"
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                            <input
                                type="color"
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                className="h-8 w-8 rounded cursor-pointer"
                            />
                            <Button type="button" size="sm" onClick={handleAddTag} disabled={!newTagName.trim()}>
                                Add
                            </Button>
                        </div>
                    )}
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

                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-stone-700">Deadline (Optional)</label>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handlePreset('today')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePreset('tomorrow')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                        >
                            Tomorrow
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePreset('weekend')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                        >
                            Weekend
                        </button>

                        <div className="h-4 w-px bg-stone-200 my-auto mx-1" />

                        {/* Relative Time */}
                        <div className="flex items-center gap-1 bg-stone-50 rounded-full px-2 py-0.5 border border-stone-200">
                            <span className="text-xs text-stone-500 pl-1">+</span>
                            <input
                                type="number"
                                min="1"
                                max="24"
                                value={relativeHours}
                                onChange={(e) => setRelativeHours(parseInt(e.target.value) || 1)}
                                className="w-8 bg-transparent text-xs text-center focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleRelativeTime}
                                className="text-xs font-medium text-stone-600 hover:text-stone-900 px-1"
                            >
                                hours later
                            </button>
                        </div>
                    </div>

                    {/* Manual Input */}
                    <div className="flex items-center gap-2">
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            onChange={(e) => setDate(e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-32"
                            disabled={!date}
                        />
                        {date && (
                            <button
                                type="button"
                                onClick={() => { setDate(''); setTime(''); }}
                                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                                title="Clear deadline"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {date && !time && (
                        <p className="text-[10px] text-stone-400">Time defaults to 23:59 if left empty.</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-stone-700">Repeat</label>
                    <div className="flex gap-2">
                        {(['none', 'daily', 'weekly', 'weekdays'] as const).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRepeat(r)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border capitalize",
                                    repeat === r
                                        ? "bg-stone-800 text-white border-stone-800"
                                        : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                                )}
                            >
                                {r === 'none' && <X className="w-3 h-3" />}
                                {r !== 'none' && <Repeat className="w-3 h-3" />}
                                {r === 'none' ? 'No Repeat' : r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-stone-700">Subtasks</label>
                    <div className="space-y-2">
                        {subtasks.map((st) => (
                            <div key={st.id} className="flex items-center gap-2 group">
                                <button
                                    type="button"
                                    onClick={() => setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s))}
                                    className="text-stone-400 hover:text-stone-600"
                                >
                                    {st.completed ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
                                </button>
                                <Input
                                    value={st.title}
                                    onChange={(e) => setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, title: e.target.value } : s))}
                                    className={cn(
                                        "h-8 text-sm flex-1 border-transparent focus:border-stone-300 px-2 py-1 shadow-none focus-visible:ring-0 hover:bg-stone-50 transition-colors",
                                        st.completed && "line-through text-stone-400"
                                    )}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSubtask(st.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a subtask..."
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    e.stopPropagation(); // Stop bubbling
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Check for double enter (within 500ms)
                                        const now = Date.now();
                                        const last = (e.currentTarget as any)._lastEnter || 0;
                                        if (now - last < 500) {
                                            handleAddSubtask();
                                        }
                                        (e.currentTarget as any)._lastEnter = now;
                                    }
                                }}
                                className="h-9 text-sm"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAddSubtask}
                                disabled={!newSubtaskTitle.trim()}
                                className="px-3"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!title.trim()}>{initialData ? "Save Changes" : "Add Task"}</Button>
                </div>
            </form>
        </Modal>
    );
}
