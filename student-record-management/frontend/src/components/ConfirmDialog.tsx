import Modal from './Modal';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = true }: Props) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-sm">
    <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{message}</p>
    <div className="flex justify-end gap-3">
      <button className="btn-secondary" onClick={onCancel}>
        Cancel
      </button>
      <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
