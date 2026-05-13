import { Toaster, toast } from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '12px',
    },
    icon: '✅',
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '12px',
    },
    icon: '❌',
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '12px',
    },
  });
};

export const ToastContainer = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: '#363636',
        color: '#fff',
      },
      success: {
        duration: 3000,
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      },
      error: {
        duration: 4000,
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      },
    }}
  />
);