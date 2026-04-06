import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface ToastMsg {
  id: number;
  text: string;
  type: "success" | "error" | "info";
  removing?: boolean;
}

interface ToastCtx {
  show: (text: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const show = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    const id = ++counter;
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, removing: true } : x)));
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 300);
    }, 3000);
  }, []);

  const colors = {
    success: "bg-success text-success-foreground",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-secondary text-secondary-foreground",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg font-body text-sm ${colors[t.type]} ${
              t.removing ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
