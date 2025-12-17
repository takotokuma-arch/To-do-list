import { RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface UndoToastProps {
    isVisible: boolean;
    onUndo: () => void;
    onClose: () => void;
}

export function UndoToast({ isVisible, onUndo, onClose }: UndoToastProps) {
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) setShouldRender(true);
        // Wait for animation to finish before unmounting (optional, for now just simple timeout logic handling inside CSS if utilizing transition)
        // For simplicity, we just rely on parent 'isVisible' prop and CSS opacity.
        // Logic: if visible, show. If not, hide.
    }, [isVisible]);

    if (!isVisible && !shouldRender) return null;

    return (
        <div
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-stone-900 text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
            )}
        >
            <span className="text-sm font-medium">Task deleted</span>
            <button
                onClick={onUndo}
                className="text-sm font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
            >
                <RotateCcw className="w-4 h-4" />
                Undo
            </button>
            <button
                onClick={onClose}
                className="ml-2 text-stone-500 hover:text-stone-300"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
