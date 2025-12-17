import { X, RotateCcw, Trash2, Archive } from 'lucide-react';
import type { Task, Tag } from '../types';
import { Button } from './ui/Button';

interface ArchiveModalProps {
    tasks: Task[];
    tags: Tag[];
    onRestore: (id: string) => void;
    onDeleteForever: (id: string) => void;
    onClose: () => void;
}

export function ArchiveModal({ tasks, tags, onRestore, onDeleteForever, onClose }: ArchiveModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                        <Archive className="w-5 h-5 text-stone-500" />
                        <h2 className="text-lg font-bold text-stone-800">Archived Tasks</h2>
                        <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-xs font-medium">
                            {tasks.length}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 text-stone-500">
                            <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No archived tasks</p>
                        </div>
                    ) : (
                        tasks.map(task => {
                            const tag = tags.find(t => t.id === task.tagId);
                            return (
                                <div key={task.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100 group hover:border-stone-200 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-stone-700 truncate">{task.title}</span>
                                            {tag && (
                                                <span
                                                    className="px-1.5 py-0.5 rounded text-[10px] text-white shrink-0"
                                                    style={{ backgroundColor: tag.color }}
                                                >
                                                    {tag.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-stone-400">
                                            Completed on {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No date'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onRestore(task.id)}
                                            className="h-8 px-2 text-stone-600 hover:text-blue-600 hover:bg-white"
                                            title="Restore to board"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onDeleteForever(task.id)}
                                            className="h-8 px-2 text-stone-600 hover:text-red-600 hover:bg-white"
                                            title="Delete forever"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-xl flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
