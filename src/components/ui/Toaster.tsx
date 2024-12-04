import { useToast } from '../../hooks/useToast';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between p-4 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          } text-white min-w-[300px]`}
        >
          <p>{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 hover:opacity-80"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}