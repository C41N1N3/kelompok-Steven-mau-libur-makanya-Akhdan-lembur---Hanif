import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { showToast } from '../../utils/toast';  

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { username: string; email: string }) => void;
  initialUsername?: string;
  initialEmail?: string;
}

export function EditProfile({
  isOpen,
  onClose,
  onSave,
  initialUsername = 'Player',
  initialEmail = 'player@example.com',
}: EditProfileProps) {
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);

  const handleSave = () => {
    onSave({ username, email });
    onClose();
    showToast.success('Profile updated!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
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
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-username" className="block text-sm font-medium text-foreground mb-1">
            Username
          </label>
          <input
            id="edit-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label htmlFor="edit-email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            placeholder="Enter email"
          />
        </div>
      </div>
    </Modal>
  );
}