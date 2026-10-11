import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut, User, onAuthStateChanged } from 'firebase/auth';
import { Shield, Terminal, Zap, LogIn, LogOut, Radio, Key } from 'lucide-react';
import { Registration } from '../types';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  onAdminClick: () => void;
  registrations: Registration[];
}

const Navbar: React.FC<NavbarProps> = ({ onNavClick, onAdminClick, registrations }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[AUTH_EXCEPTION] Signout failed:', err);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  };

  const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
  const fundsRaised = confirmedCount * 50;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${
          scrolled || mobileMenuOpen 
            ? 'bg-[#06060c]/95 backdrop-blur-md border-[#00ffff]/30 py-3 shadow-[0_4px_20px_rgba(0,255,255,0.15)]' 
            : 'bg-[#06060c]/70 backdrop-blur-sm border-[#00ffff]/20 py-5'
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo Terminal Brand */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onNavClick(e, '');
            }}
            className="group flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 border border-[#00ffff] bg-[#00ffff]/10 flex items-center justify-center relative overflow-hidden group-hover:border-[#ff007f] transition-colors">
              <span className="font-pixel text-[#00ffff] group-hover:text-[#ff007f] text-sm animate-pulse">LAM</span>
              <div className="absolute inset-0 bg-gradient-to-t from-[#ff007f]/20 to-transparent pointer-events-none"></div>
            </div>
            <div>
              <div className="font-pixel text-base md:text-lg tracking-wider text-[#00ffff] group-hover:text-[#ff007f] transition-colors glitch-text">
                LARIAN AMAL MERDEKA
              </div>
              <div className="font-tech text-xs tracking-widest text-[#ff007f] flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-ping"></span>
                <span>31.08.CYCLE // CHARITY MATRIX</span>
              </div>
            </div>
          </a>

          {/* Telemetry Live Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 border border-[#00ffff]/30 bg-[#0a0a14] font-tech text-xs">
            <div className="flex items-center gap-2 text-[#00ffff]">
              <Radio className="w-3.5 h-3.5 text-[#00ffff] animate-pulse" />
              <span>NODES REGISTERED:</span>
              <span className="font-pixel text-[#ffe600] font-bold">{confirmedCount}</span>
            </div>
            <span className="text-[#ff007f]/40">|</span>
            <div className="flex items-center gap-2 text-[#00ffff]">
              <span>CHARITY POOL:</span>
              <span className="font-pixel text-[#00ffff] font-bold">RM {fundsRaised.toLocaleString()}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-tech text-xs tracking-widest uppercase text-[#00ffff]">
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-[#ff007f] transition-colors hover:underline">
              // MISSION
            </a>
            <a href="#tiers" onClick={(e) => handleLinkClick(e, 'tiers')} className="hover:text-[#ff007f] transition-colors hover:underline">
              // TIERS
            </a>
            <a href="#registry" onClick={(e) => handleLinkClick(e, 'registry')} className="hover:text-[#ff007f] transition-colors hover:underline">
              // RUNNERS
            </a>
            <a 
              href="#register" 
              onClick={(e) => handleLinkClick(e, 'register')} 
              className="px-3 py-1.5 border border-[#00ffff] bg-[#00ffff]/10 text-[#00ffff] hover:bg-[#ff007f] hover:text-[#000] hover:border-[#ff007f] transition-all font-pixel text-xs tracking-wide shadow-[0_0_10px_rgba(0,255,255,0.3)]"
            >
              [REGISTER NOW]
            </a>
          </div>

          {/* Auth & Admin Controls */}
          <div className="flex items-center gap-4">
            {/* Direct Login or User Badge */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-3 border border-[#00ffff]/40 bg-[#0c0c1a] px-3 py-1">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-6 h-6 rounded-none border border-[#00ffff]" />
                ) : (
                  <div className="w-6 h-6 bg-[#00ffff]/20 border border-[#00ffff] flex items-center justify-center font-pixel text-[10px]">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="font-tech text-xs truncate max-w-[130px] text-[#00ffff]">
                  {currentUser.displayName || currentUser.email}
                </div>
                <button 
                  onClick={handleLogout}
                  title="Disconnect Node"
                  className="text-[#ff007f] hover:text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-2 border border-[#00ffff]/60 bg-[#0a0a14] px-3 py-1.5 font-pixel text-xs text-[#00ffff] hover:border-[#00ffff] hover:bg-[#00ffff]/20 hover:text-white transition-colors shadow-[0_0_10px_rgba(0,255,255,0.2)]"
              >
                <Key className="w-3.5 h-3.5 text-[#00ffff]" />
                <span>[LOG IN / EMAIL AUTH]</span>
              </button>
            )}

            {/* Admin Console Switch */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onAdminClick();
              }}
              className="flex items-center gap-1.5 border border-[#ff007f] bg-[#ff007f]/10 text-[#ff007f] px-3 py-1.5 font-pixel text-[11px] hover:bg-[#ff007f] hover:text-[#000] transition-all shadow-[0_0_10px_rgba(255,0,127,0.3)]"
            >
              <Terminal className="w-3 h-3" />
              <span>SYS_OP</span>
            </button>

            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border border-[#00ffff] p-1.5 text-[#00ffff] hover:bg-[#00ffff]/10"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-[#00ffff]"></span>
                <span className="w-full h-0.5 bg-[#ff007f]"></span>
                <span className="w-full h-0.5 bg-[#00ffff]"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#06060c]/98 pt-24 px-6 flex flex-col justify-between pb-12 border-b border-[#00ffff]/30">
          <div className="space-y-6 font-pixel text-sm tracking-wider">
            <div className="p-3 border border-[#00ffff]/30 bg-[#090916] font-tech text-xs text-[#00ffff]">
              <div>LIVE RUNNERS: <span className="text-[#ffe600] font-pixel">{confirmedCount}</span></div>
              <div>CHARITY POOL: <span className="text-[#00ffff] font-pixel">RM {fundsRaised.toLocaleString()}</span></div>
            </div>

            <a 
              href="#about" 
              onClick={(e) => handleLinkClick(e, 'about')} 
              className="block text-[#00ffff] hover:text-[#ff007f] border-b border-[#00ffff]/20 pb-3"
            >
              [01] // EVENT MISSION
            </a>
            <a 
              href="#tiers" 
              onClick={(e) => handleLinkClick(e, 'tiers')} 
              className="block text-[#00ffff] hover:text-[#ff007f] border-b border-[#00ffff]/20 pb-3"
            >
              [02] // RUN CATEGORIES
            </a>
            <a 
              href="#registry" 
              onClick={(e) => handleLinkClick(e, 'registry')} 
              className="block text-[#00ffff] hover:text-[#ff007f] border-b border-[#00ffff]/20 pb-3"
            >
              [03] // RUNNERS DATABASE
            </a>
            <a 
              href="#register" 
              onClick={(e) => handleLinkClick(e, 'register')} 
              className="block text-[#ffe600] border-b border-[#00ffff]/20 pb-3"
            >
              [04] // REGISTER NOW (RM 50)
            </a>

            {currentUser ? (
              <div className="pt-4 flex items-center justify-between border-t border-[#00ffff]/30 text-xs font-tech">
                <span className="text-[#00ffff] truncate max-w-[200px]">{currentUser.email}</span>
                <button onClick={handleLogout} className="text-[#ff007f] border border-[#ff007f] px-2 py-1">
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }} 
                className="w-full border border-[#00ffff] text-[#00ffff] bg-[#00ffff]/10 py-3 font-pixel text-xs flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" /> [MASUK EMAIL & PASSWORD DIRECT]
              </button>
            )}
          </div>

          <div className="font-tech text-xs text-center text-[#ff007f]">
            LARIAN AMAL MERDEKA // TRANSMISSION FREQ: 31.08.3026
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
