import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {CheckCircle2, AlertCircle} from 'lucide-react';
import './toast.css';

const ToastContext = createContext(null);
const TOAST_DURATION_MS = 3000;

export function ToastProvider({children}) {
  const [toast, setToast] = useState(null);
  const sequence = useRef(0);

  const notify = useCallback((message, type = 'success') => {
    if (!message) return;
    sequence.current += 1;
    setToast({id: sequence.current, message: String(message), type});
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    // A new toast starts a new three-second countdown; old timers are cleaned up.
    const timer = window.setTimeout(() => {
      setToast(current => current?.id === toast.id ? null : current);
    }, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast?.id]);

  return <ToastContext.Provider value={notify}>
    {children}
    <div className="yomioToastViewport" aria-live="polite" aria-atomic="true">
      {toast && <div key={toast.id} className={'yomioToast '+(toast.type === 'error' ? 'error' : 'success')}
        role={toast.type === 'error' ? 'alert' : 'status'}>
        {toast.type === 'error' ? <AlertCircle size={21} aria-hidden="true"/> : <CheckCircle2 size={21} aria-hidden="true"/>}
        <span>{toast.message}</span>
      </div>}
    </div>
  </ToastContext.Provider>;
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast must be used inside ToastProvider');
  return notify;
}
