import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      style: {
        background: '#122131',
        color: '#D4E4FA',
        border: '1px solid #273647',
      },
      iconTheme: {
        primary: '#4CD7F6',
        secondary: '#122131',
      },
    }),

  error: (message: string) =>
    toast.error(message, {
      style: {
        background: '#122131',
        color: '#D4E4FA',
        border: '1px solid #273647',
      },
      iconTheme: {
        primary: '#FF0004',
        secondary: '#122131',
      },
    }),

  loading: (message: string) =>
    toast.loading(message, {
      style: {
        background: '#122131',
        color: '#D4E4FA',
        border: '1px solid #273647',
      },
    }),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    toast.promise(promise, messages, {
      style: {
        background: '#122131',
        color: '#D4E4FA',
        border: '1px solid #273647',
      },
      success: {
        iconTheme: { primary: '#4CD7F6', secondary: '#122131' },
      },
      error: {
        iconTheme: { primary: '#FF0004', secondary: '#122131' },
      },
    }),
};