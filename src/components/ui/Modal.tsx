import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className={cn(
                "relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
                "animate-in fade-in zoom-in-95 duration-200"
            )}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                    <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-stone-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-stone-500" />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
