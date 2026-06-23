import { useState } from 'react';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { Slider } from '../components/shared/Slider';
import LogoutIcon from '../assets/logout.svg';
import { EditProfile } from '../components/settings/EditProfile';
import { ChangePassword } from '../components/settings/ChangePassword';
import { showToast } from '../utils/toast';

export default function Settings() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [masterVolume, setMasterVolume] = useState(75);
  const [bgmVolume, setBgmVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(65);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    console.log('Logging out...');
    showToast.success('Logged out successfully!');
  };

  const handleEditProfile = (data: { username: string; email: string }) => {
    console.log('Profile updated:', data);
  };

  const handleChangePassword = (data: { oldPassword: string; newPassword: string }) => {
    console.log('Password changed:', data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-space-grotesk text-foreground font-semibold">
        Settings
      </h1>

      {/* Account Settings */}
      <div className="bg-surface rounded-xl border border-secondary p-6 space-y-3">
        <h2 className="text-primary text-lg font-medium">Account Settings</h2>
        <div className="divide-y divide-secondary">
          <div className="py-2.5">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="text-foreground text-sm font-medium hover:text-primary transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="py-2.5">
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="text-foreground text-sm font-medium hover:text-primary transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="bg-surface rounded-xl border border-secondary p-6 space-y-4">
        <h2 className="text-primary text-lg font-medium">Volume / Audio</h2>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-foreground">Master Volume</label>
              <span className="text-sm text-dimmed">{masterVolume}%</span>
            </div>
            <Slider value={masterVolume} onChange={setMasterVolume} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-foreground">BGM</label>
              <span className="text-sm text-dimmed">{bgmVolume}%</span>
            </div>
            <Slider value={bgmVolume} onChange={setBgmVolume} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-foreground">SFX</label>
              <span className="text-sm text-dimmed">{sfxVolume}%</span>
            </div>
            <Slider value={sfxVolume} onChange={setSfxVolume} />
          </div>
        </div>
      </div>

      {/* Terminate Session */}
      <div className="bg-surface rounded-xl border border-secondary">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex justify-between items-center px-6 py-4 rounded-xl hover:bg-error/10 transition-colors"
          aria-label="Log Out"
        >
          <h2 className="text-error text-lg font-medium">Terminate Session</h2>
          <LogoutIcon className="w-6 h-6 text-error" />
        </button>
      </div>

      {/* Modals */}
      <EditProfile
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleEditProfile}
        initialUsername="Player"
        initialEmail="player@example.com"
      />

      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSave={handleChangePassword}
      />

      <ConfirmationDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => { handleLogout(); window.location.href = '/login'; }}
        title="Log Out"
        description="Are you sure you want to log out of BrainWave?"
        confirmText="Log Out"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}