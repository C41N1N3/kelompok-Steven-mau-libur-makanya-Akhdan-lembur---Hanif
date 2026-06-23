import { Modal } from './Modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
}: ConfirmationDialogProps) {
  const confirmColor =
    confirmVariant === 'danger'
      ? 'bg-error hover:bg-error/80 text-white'
      : 'bg-primary hover:bg-primary/80 text-background';

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg border border-secondary text-foreground hover:bg-secondary/30 transition-colors text-sm font-medium"
      >
        {cancelText}
      </button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${confirmColor}`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <p className="text-dimmed text-sm">{description}</p>
    </Modal>
  );
}