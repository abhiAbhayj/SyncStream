import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export default function LogoutConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-logout-confirm', handleOpen);
    window.addEventListener('close-logout-confirm', handleClose);

    return () => {
      window.removeEventListener('open-logout-confirm', handleOpen);
      window.removeEventListener('close-logout-confirm', handleClose);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleConfirmLogout = () => {
    setIsOpen(false);
    setToastMessage(null);
    logout();
    navigate('/login', {
      state: { message: 'You have been successfully signed out.' }
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    setToastMessage('Logout cancelled — Your session remains active.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <>
      {/* Toast Notification when logout is cancelled */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[130] flex items-center gap-2.5 px-4 py-3 bg-[#0c1228]/95 border border-accentCyan/40 text-accentCyan rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-md animate-slide-up text-xs font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-accentCyan animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
            onClick={handleCancel}
          />

          {/* Modal Dialog */}
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0c1024]/95 border border-white/15 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.85)] animate-slide-up overflow-hidden">
            {/* Top Gradient Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-accentPurple to-accentCyan" />

            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Content */}
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.35)]">
                  <LogOut className="w-8 h-8 fill-rose-500/25 stroke-[2.2]" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-black/90 border border-amber-400/40 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white font-dmsans">
                  Sign Out of SyncStream?
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-poppins leading-relaxed">
                  {user?.username ? (
                    <>Signed in as <strong className="text-white font-semibold">@{user.username}</strong>. </>
                  ) : null}
                  Are you sure you want to end your session? You can sign back in anytime.
                </p>
              </div>

              {/* Action Buttons: Cancel & Confirm */}
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-sm transition-all duration-200 active:scale-95 cursor-pointer font-poppins"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 font-poppins"
                >
                  <LogOut className="w-4 h-4 fill-white/20" />
                  <span>Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
