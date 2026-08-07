import React from 'react';
import { AlertTriangle, LogIn, X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
};

export default function LoginRequiredModal({ isOpen, onClose, message = "Silakan masuk terlebih dahulu untuk melanjutkan." }: Props) {
  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose();
    // Dispatch custom event to open AuthModal in Navbar
    window.dispatchEvent(new CustomEvent('open_auth_modal'));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        {/* Header pattern */}
        <div className="h-24 bg-gradient-to-br from-amber-500/20 to-black relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-10 relative flex flex-col items-center text-center">
          {/* Icon */}
          <div className="absolute -top-12 w-24 h-24 bg-[#1A1A1A] rounded-full p-2 flex items-center justify-center border-t border-white/10">
            <div className="w-full h-full bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          <h3 className="font-heading font-extrabold text-2xl text-white mb-2">Akses Terbatas</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {message}
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={handleLoginClick}
              className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
            >
              <LogIn className="w-5 h-5" />
              <span>Masuk / Daftar Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
