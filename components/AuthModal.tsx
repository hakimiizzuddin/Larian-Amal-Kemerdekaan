import React, { useState } from 'react';
import { 
  auth, 
  googleProvider 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { 
  X, 
  Key, 
  Mail, 
  Lock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  LogIn, 
  UserPlus,
  ExternalLink
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [consoleGuide, setConsoleGuide] = useState(false);

  if (!isOpen) return null;

  const handleDirectEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setConsoleGuide(false);
    setLoading(true);

    try {
      if (tab === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        if (!password || password.length < 6) {
          throw new Error('Password sequence must be at least 6 characters.');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(userCredential.user, { displayName: displayName.trim() });
        }
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[AUTH_ERROR]', err);
      const code = err.code || '';
      
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg('EMAIL/PASSWORD PROVIDER IS NOT ACTIVATED IN FIREBASE CONSOLE.');
        setConsoleGuide(true);
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMsg('INVALID CREDENTIAL MATRIX. CHECK EMAIL & PASSWORD.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('EMAIL NODE ALREADY REGISTERED. PLEASE SWITCH TO SIGN IN TAB.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('SECURITY SEQUENCE TOO WEAK. MINIMUM 6 CHARACTERS REQUIRED.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('MALFORMED EMAIL FORMAT DETECTED.');
      } else {
        setErrorMsg(err.message || 'AUTHENTICATION REJECTED BY SERVER MATRIX.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePopup = async () => {
    setErrorMsg(null);
    setConsoleGuide(false);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[GOOGLE_AUTH_ERROR]', err);
      setErrorMsg(err.message || 'GOOGLE AUTH PIPELINE ABORTED.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030308]/90 backdrop-blur-md animate-fade-in-up">
      {/* CRT Overlay on modal */}
      <div className="absolute inset-0 crt-overlay pointer-events-none"></div>

      <div className="relative w-full max-w-md border-2 border-[#00ffff] bg-[#070716] p-6 sm:p-8 neon-box-cyan text-left shadow-[0_0_35px_rgba(0,255,255,0.3)]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#00ffff]/30 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#00ffff] animate-pulse" />
            <div>
              <div className="font-pixel text-xs text-[#00ffff]">SYS_AUTH // ACCESS PORTAL</div>
              <div className="font-tech text-[10px] text-[#ff007f]">DIRECT CREDENTIAL MATRIX</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#00ffff]/60 hover:text-[#ff007f] p-1 border border-transparent hover:border-[#ff007f] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Direct Sign In vs Register */}
        <div className="grid grid-cols-2 gap-2 mb-6 border border-[#00ffff]/30 p-1 bg-[#04040c]">
          <button
            type="button"
            onClick={() => { setTab('signin'); setErrorMsg(null); }}
            className={`py-2 font-pixel text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              tab === 'signin'
                ? 'bg-[#00ffff] text-[#000] shadow-[0_0_10px_rgba(0,255,255,0.4)]'
                : 'text-[#00ffff]/70 hover:text-[#00ffff]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>[SIGN IN]</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`py-2 font-pixel text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'bg-[#ff007f] text-[#fff] shadow-[0_0_10px_rgba(255,0,127,0.4)]'
                : 'text-[#ff007f]/70 hover:text-[#ff007f]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>[NEW NODE]</span>
          </button>
        </div>

        {/* Direct Email & Password Form */}
        <form onSubmit={handleDirectEmailAuth} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block font-pixel text-[10px] text-[#00ffff] uppercase mb-1">
                RUNNER IDENTIFIER / DISPLAY NAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-[#00ffff]/50" />
                <input 
                  type="text"
                  placeholder="e.g. Neo Runner"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#04040a] border border-[#00ffff]/40 pl-10 pr-3 py-2.5 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-pixel text-[10px] text-[#00ffff] uppercase mb-1">
              EMAIL ADDRESS <span className="text-[#ff007f]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#00ffff]/50" />
              <input 
                type="email"
                required
                placeholder="runner@merdeka.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#04040a] border border-[#00ffff]/40 pl-10 pr-3 py-2.5 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-pixel text-[10px] text-[#00ffff] uppercase mb-1">
              PASSWORD SECURITY KEY <span className="text-[#ff007f]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#00ffff]/50" />
              <input 
                type="password"
                required
                minLength={6}
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#04040a] border border-[#00ffff]/40 pl-10 pr-3 py-2.5 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f] transition-colors"
              />
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3 border border-[#ff007f] bg-[#ff007f]/10 text-[#ff007f] font-tech text-xs space-y-2">
              <div className="flex items-center gap-2 font-pixel text-[10px]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#ff007f]" />
                <span>{errorMsg}</span>
              </div>
              
              {consoleGuide && (
                <div className="pt-2 border-t border-[#ff007f]/30 text-[11px] text-[#ffe600] space-y-1">
                  <div className="font-bold">// CARA AKTIFKAN EMAIL/PASSWORD DI FIREBASE:</div>
                  <ol className="list-decimal list-inside space-y-0.5 text-[#00ffff]/90">
                    <li>Buka <b>Firebase Console</b> &#10142; Projek Anda</li>
                    <li>Pilih menu <b>Authentication</b> &#10142; Tab <b>Sign-in method</b></li>
                    <li>Klik <b>Email/Password</b> &#10142; Aktifkan toggle <b>Enable</b></li>
                    <li>Klik <b>Save</b></li>
                  </ol>
                  <div className="text-[10px] text-[#ff007f] pt-1">
                    *Sementara itu, anda boleh terus menggunakan butang <b>GOOGLE FAST AUTH</b> di bawah!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 border-2 font-pixel text-xs tracking-wider uppercase transition-all disabled:opacity-50 ${
              tab === 'signin'
                ? 'border-[#00ffff] bg-[#00ffff] text-[#000] hover:bg-[#ff007f] hover:border-[#ff007f] hover:text-[#fff]'
                : 'border-[#ff007f] bg-[#ff007f] text-[#fff] hover:bg-[#00ffff] hover:border-[#00ffff] hover:text-[#000]'
            }`}
          >
            {loading 
              ? '[CONNECTING TO QUANTUM KERNEL...]' 
              : tab === 'signin' 
                ? '[LOG IN DIRECT WITH EMAIL]' 
                : '[CREATE ACCOUNT WITH EMAIL]'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#00ffff]/20"></div>
          </div>
          <span className="relative px-3 bg-[#070716] font-tech text-[10px] text-[#ff007f]">
            // OR FAST GOOGLE AUTH //
          </span>
        </div>

        {/* Google Popup Auth */}
        <button
          type="button"
          onClick={handleGooglePopup}
          disabled={loading}
          className="w-full py-3 border border-[#00ffff]/60 bg-[#00ffff]/10 font-tech text-xs text-[#00ffff] hover:bg-[#00ffff]/20 hover:border-[#00ffff] transition-colors flex items-center justify-center gap-2"
        >
          <Cpu className="w-4 h-4 text-[#00ffff]" />
          <span>SIGN IN WITH GOOGLE CLOUD OAUTH</span>
        </button>
      </div>
    </div>
  );
};
