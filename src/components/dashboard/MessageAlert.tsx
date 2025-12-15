'use client';

interface MessageAlertProps {
  message: string | null;
  type: 'success' | 'error';
}

export default function MessageAlert({ message, type }: MessageAlertProps) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  };

  return (
    <div className={`mb-4 rounded-md p-4 border ${styles[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}
