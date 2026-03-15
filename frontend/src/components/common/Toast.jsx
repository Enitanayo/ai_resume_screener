import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

// Singleton state for managing toasts
let toastListeners = [];
let toastId = 0;

const notify = (message, type = 'success', duration = 3000) => {
    const id = ++toastId;
    const toast = { id, message, type, duration };
    toastListeners.forEach((listener) => listener(toast));
    return id;
};

// Public API
export const showToast = {
    success: (message, duration) => notify(message, 'success', duration),
    error: (message, duration) => notify(message, 'error', duration),
    info: (message, duration) => notify(message, 'info', duration),
    warning: (message, duration) => notify(message, 'warning', duration),
};

// Icon + color config per type
const toastConfig = {
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        iconColor: 'text-emerald-400',
        textColor: 'text-emerald-300',
        glow: 'shadow-emerald-500/5',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        iconColor: 'text-red-400',
        textColor: 'text-red-300',
        glow: 'shadow-red-500/5',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        iconColor: 'text-blue-400',
        textColor: 'text-blue-300',
        glow: 'shadow-blue-500/5',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-300',
        glow: 'shadow-amber-500/5',
    },
};

// Individual toast item
const ToastItem = ({ toast, onRemove }) => {
    const [phase, setPhase] = useState('enter'); // enter → visible → exit
    const config = toastConfig[toast.type] || toastConfig.success;
    const Icon = config.icon;

    useEffect(() => {
        // Start visible phase after enter animation
        const enterTimeout = setTimeout(() => setPhase('visible'), 50);

        // Start exit after duration
        const exitTimeout = setTimeout(() => {
            setPhase('exit');
        }, toast.duration);

        // Remove after exit animation completes
        const removeTimeout = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration + 400);

        return () => {
            clearTimeout(enterTimeout);
            clearTimeout(exitTimeout);
            clearTimeout(removeTimeout);
        };
    }, [toast, onRemove]);

    const animationClasses = {
        enter: 'opacity-0 scale-90 translate-y-4',
        visible: 'opacity-100 scale-100 translate-y-0',
        exit: 'opacity-0 scale-90 -translate-y-4',
    };

    return (
        <div
            className={`
                flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl
                shadow-2xl ${config.glow} ${config.bg} ${config.border}
                bg-dark-900/80
                transition-all duration-400 ease-out
                ${animationClasses[phase]}
            `}
        >
            <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <p className={`text-sm font-medium ${config.textColor}`}>
                {toast.message}
            </p>
        </div>
    );
};

// Toast container rendered via portal
const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const listener = (toast) => {
            setToasts((prev) => [...prev, toast]);
        };
        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter((l) => l !== listener);
        };
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return createPortal(
        <div className="fixed inset-0 pointer-events-none z-[9999] flex flex-col items-center justify-start pt-20 gap-3">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={removeToast} />
                </div>
            ))}
        </div>,
        document.body
    );
};

export default ToastContainer;
