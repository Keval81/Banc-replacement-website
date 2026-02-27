"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, options?: { duration?: number; action?: Toast["action"] }) => void;
  removeToast: (id: string) => void;
  success: (message: string, options?: { duration?: number; action?: Toast["action"] }) => void;
  error: (message: string, options?: { duration?: number; action?: Toast["action"] }) => void;
  info: (message: string, options?: { duration?: number; action?: Toast["action"] }) => void;
  warning: (message: string, options?: { duration?: number; action?: Toast["action"] }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export function ToastProvider({ children, position = "bottom-right" }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((
    message: string, 
    type: ToastType, 
    options?: { duration?: number; action?: Toast["action"] }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = options?.duration ?? 5000;

    setToasts((prev) => [...prev, { id, message, type, duration, action: options?.action }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, options?: { duration?: number; action?: Toast["action"] }) => {
    addToast(message, "success", options);
  }, [addToast]);

  const error = useCallback((message: string, options?: { duration?: number; action?: Toast["action"] }) => {
    addToast(message, "error", options);
  }, [addToast]);

  const info = useCallback((message: string, options?: { duration?: number; action?: Toast["action"] }) => {
    addToast(message, "info", options);
  }, [addToast]);

  const warning = useCallback((message: string, options?: { duration?: number; action?: Toast["action"] }) => {
    addToast(message, "warning", options);
  }, [addToast]);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-24 left-1/2 -translate-x-1/2", // Above mobile nav
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Container */}
      <div 
        className={cn(
          "fixed z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0 pointer-events-none",
          positionClasses[position]
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    error: "bg-red-500/10 text-red-600 border-red-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg",
        "bg-background",
        colors[toast.type]
      )}
      role="alert"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.message}</p>
        
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onRemove(toast.id);
            }}
            className="mt-2 text-sm font-medium underline underline-offset-2 hover:opacity-80"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
