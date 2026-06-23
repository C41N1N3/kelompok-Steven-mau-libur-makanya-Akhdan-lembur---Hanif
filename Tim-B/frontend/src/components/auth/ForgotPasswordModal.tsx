import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../shared/Modal';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API Call
    console.log('Reset password for:', email);
    toast.success(`Password reset email sent to ${email}`);
    setStep('success');
  };

  const handleClose = () => {
    // Reset state when closing
    setEmail('');
    setStep('form');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password">
      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-dimmed text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-background font-semibold py-3 rounded-xl hover:bg-primary/80 transition-colors"
          >
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center text-4xl mb-2">📧</div>
          <p className="text-foreground text-center font-medium">
            Password reset request was sent to
          </p>
          <p className="text-primary text-center font-semibold">{email}</p>
          <p className="text-dimmed text-sm text-center">
            Please check your inbox and follow the instructions.
          </p>
          <button
            onClick={handleClose}
            className="w-full border border-secondary text-foreground font-medium py-3 rounded-xl hover:bg-secondary/30 transition-colors mt-2"
          >
            Close
          </button>
        </div>
      )}
    </Modal>
  );
}