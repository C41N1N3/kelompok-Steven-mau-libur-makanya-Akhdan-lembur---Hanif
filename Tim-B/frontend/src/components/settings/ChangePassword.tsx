import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { showToast } from '../../utils/toast';

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { oldPassword: string; newPassword: string }) => void;
}

export function ChangePassword({
  isOpen,
  onClose,
  onSave,
}: ChangePasswordProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      showToast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      showToast.error('New password must be at least 8 characters.');
      return;
    }
    setError('');
    onSave({ oldPassword, newPassword });
    onClose();
    showToast.success('Password changed!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-secondary text-foreground hover:bg-secondary/30 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-background font-medium transition-colors text-sm"
          >
            Update Password
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="old-password" className="block text-sm font-medium text-foreground mb-1">
            Current Password
          </label>
          <input
            id="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            placeholder="Confirm new password"
          />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
      </div>
    </Modal>
  );
}