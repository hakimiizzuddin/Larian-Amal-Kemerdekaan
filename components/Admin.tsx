import React, { useState } from 'react';
import { Registration } from '../types';
import { 
  updateRegistrationStatus, 
  deleteRegistration, 
  seedInitialRegistrations 
} from '../services/registrationService';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  Terminal, 
  ShieldAlert, 
  Trash2, 
  Download, 
  Search, 
  Key, 
  ArrowLeft,
  Database,
  Mail,
  Lock,
  Cpu,
  LogIn,
  AlertTriangle
} from 'lucide-react';

interface AdminProps {
  onBack: () => void;
  registrations: Registration[];
}

const ADMIN_PRIMARY_EMAIL = 'hakimiizzuddin@gmail.com';

const Admin: React.FC<AdminProps> = ({ onBack, registrations }) => {
  // Login modes: 'email' | 'passcode' | 'google'
  const [loginMethod, setLoginMethod] = useState<'email' | 'passcode'>('email');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [sysPasscode, setSysPasscode] = useState('');
  const [passAuthenticated, setPassAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [consoleGuide, setConsoleGuide] = useState(false);

  // Table filters & actions
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [seedingLoading, setSeedingLoading] = useState(false);

  const currentUser = auth.currentUser;
  // Operator authenticated if logged in with Google/Email matching primary admin, or any signed-in user, or passAuthenticated
  const isGoogleAdmin = currentUser?.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase();
  const isAuthenticated = passAuthenticated || isGoogleAdmin || (currentUser !== null);

  const handleDirectEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setConsoleGuide(false);
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, adminEmail.trim(), adminPassword);
    } catch (err: any) {
      console.error('[ADMIN_AUTH_ERROR]', err);
      const code = err.code || '';
      if (code === 'auth/operation-not-allowed') {
        setAuthError('EMAIL/PASSWORD PROVIDER IS DISABLED IN FIREBASE CONSOLE.');
        setConsoleGuide(true);
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setAuthError('INVALID EMAIL OR PASSWORD CREDENTIALS.');
      } else {
        setAuthError(err.message || 'AUTHENTICATION REJECTED.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (sysPasscode === '123' || sysPasscode === 'merdeka3026' || sysPasscode === 'admin') {
      setPassAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('[ACCESS_DENIED] Passcode mismatch. Access rejected.');
      setSysPasscode('');
    }
  };

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    setConsoleGuide(false);
    setLoginLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error('[AUTH_ERROR]', e);
      setAuthError(e.message || 'GOOGLE AUTH PIPELINE ABORTED.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogoutAdmin = async () => {
    setPassAuthenticated(false);
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (reg: Registration) => {
    const nextStatus = reg.status === 'confirmed' ? 'cancelled' : 'confirmed';
    setActionLoadingId(reg.id);
    try {
      await updateRegistrationStatus(reg.id, nextStatus);
    } catch (e) {
      console.error('[TOGGLE_ERROR]', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`[SYS_CONFIRM] Delete participant record for "${name}" from Firestore?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await deleteRegistration(id);
    } catch (e) {
      console.error('[DELETE_ERROR]', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSeedData = async () => {
    setSeedingLoading(true);
    try {
      await seedInitialRegistrations();
    } catch (e) {
      console.error('[SEED_ERROR]', e);
    } finally {
      setSeedingLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Bib Number', 'Full Name', 'Email', 'Category', 'T-Shirt Size', 'Fee Paid (MYR)', 'Emergency Contact', 'Status', 'Registered At'];
    const rows = registrations.map(r => [
      r.id,
      r.bibNumber,
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.email,
      r.category,
      r.tshirtSize || 'M',
      r.feePaid,
      `"${(r.emergencyContact || '').replace(/"/g, '""')}"`,
      r.status,
      r.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `larian_amal_merdeka_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const confirmedRunners = registrations.filter(r => r.status === 'confirmed');
  const totalFunds = confirmedRunners.length * 50;
  const countVeteran = confirmedRunners.filter(r => r.category === '10km_veteran').length;
  const countOpen = confirmedRunners.filter(r => r.category === '10km_open').length;
  const countFun = confirmedRunners.filter(r => r.category === '5km_fun').length;

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bibNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStat = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-24 min-h-[85vh]">
      {/* Return button */}
      <button 
        onClick={onBack}
        className="mb-8 font-tech text-xs tracking-widest text-[#00ffff] hover:text-[#ff007f] transition-colors flex items-center gap-2 border border-[#00ffff]/30 px-3 py-1.5 bg-[#0a0a18]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>[RETURN TO PUBLIC TERMINAL]</span>
      </button>

      {/* Terminal Header */}
      <div className="mb-12 border-b border-[#ff007f]/40 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-tech text-[#ff007f] mb-1">
            <Terminal className="w-4 h-4" />
            <span>SYS_OP // LEVEL_4 KERNEL CONSOLE</span>
          </div>
          <h1 className="font-pixel text-3xl sm:text-4xl text-[#00ffff] glitch-text">
            ADMINISTRATION REPOSITORY
          </h1>
          <p className="font-tech text-xs text-[#00ffff]/60 mt-1">
            LIVE FIRESTORE CONTROL MATRIX FOR PARTICIPANTS & CHARITY ASSETS
          </p>
        </div>

        {isAuthenticated && (
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 border border-[#00ffff] bg-[#00ffff]/10 font-pixel text-xs text-[#00ffff] hover:bg-[#00ffff] hover:text-[#000] transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>[EXPORT CSV]</span>
            </button>
            <button 
              onClick={handleSeedData}
              disabled={seedingLoading}
              className="px-4 py-2 border border-[#ffe600] bg-[#ffe600]/10 font-pixel text-xs text-[#ffe600] hover:bg-[#ffe600] hover:text-[#000] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{seedingLoading ? '[INJECTING...]' : '[SEED SAMPLE TELEMETRY]'}</span>
            </button>
            <button
              onClick={handleLogoutAdmin}
              className="px-3 py-2 border border-[#ff007f] bg-transparent font-pixel text-xs text-[#ff007f] hover:bg-[#ff007f] hover:text-[#fff] transition-colors"
            >
              [LOCK TERMINAL]
            </button>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        /* Multi-Option Login Gate: Email & Password, Google, Passcode */
        <div className="max-w-md mx-auto p-8 border-2 border-[#ff007f] bg-[#070716] neon-box-magenta">
          <div className="text-center mb-6">
            <ShieldAlert className="w-8 h-8 text-[#ff007f] mx-auto mb-2 animate-pulse" />
            <h2 className="font-pixel text-lg text-[#00ffff]">OPERATOR CLEARANCE REQUIRED</h2>
            <p className="font-tech text-xs text-[#00ffff]/60 mt-1">
              MASUKKAN EMAIL & PASSWORD DIRECT, GOOGLE AUTH, ATAU PASSCODE.
            </p>
          </div>

          {/* Toggle between Direct Email and Passcode Override */}
          <div className="grid grid-cols-2 gap-2 mb-6 border border-[#00ffff]/30 p-1 bg-[#04040c]">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setAuthError(null); }}
              className={`py-2 font-pixel text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'email'
                  ? 'bg-[#00ffff] text-[#000]'
                  : 'text-[#00ffff]/70 hover:text-[#00ffff]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>[DIRECT EMAIL]</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginMethod('passcode'); setAuthError(null); }}
              className={`py-2 font-pixel text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'passcode'
                  ? 'bg-[#ff007f] text-[#fff]'
                  : 'text-[#ff007f]/70 hover:text-[#ff007f]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>[PASSCODE]</span>
            </button>
          </div>

          {/* Direct Email & Password Form */}
          {loginMethod === 'email' ? (
            <form onSubmit={handleDirectEmailLogin} className="space-y-4">
              <div>
                <label className="block font-tech text-xs text-[#00ffff] mb-1 uppercase">
                  OPERATOR EMAIL
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#00ffff]/40" />
                  <input 
                    type="email"
                    required
                    placeholder={ADMIN_PRIMARY_EMAIL}
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-[#04040a] border border-[#00ffff]/40 pl-10 pr-3 py-2.5 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f]"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-tech text-xs text-[#00ffff] mb-1 uppercase">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#00ffff]/40" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-[#04040a] border border-[#00ffff]/40 pl-10 pr-3 py-2.5 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f]"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 border border-[#ff007f] bg-[#ff007f]/10 text-[#ff007f] font-tech text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                  {consoleGuide && (
                    <div className="text-[11px] text-[#ffe600] pt-1 border-t border-[#ff007f]/30">
                      Cara aktifkan: Firebase Console &#10142; Authentication &#10142; Sign-in method &#10142; Email/Password &#10142; Enable &#10142; Save. Anda juga boleh log masuk guna Google atau passcode 123!
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 border-2 border-[#00ffff] bg-[#00ffff] text-[#000] font-pixel text-xs tracking-wider uppercase hover:bg-transparent hover:text-[#00ffff] transition-all disabled:opacity-50"
              >
                {loginLoading ? '[VERIFYING CREDENTIALS...]' : '[LOG IN WITH EMAIL DIRECT]'}
              </button>
            </form>
          ) : (
            /* Emergency Passcode Form */
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <label className="block font-tech text-xs text-[#00ffff] mb-2 uppercase">
                  SYS_OP PASSCODE (DEFAULT: 123)
                </label>
                <input 
                  type="password" 
                  value={sysPasscode}
                  onChange={(e) => setSysPasscode(e.target.value)}
                  placeholder="Enter passcode (123)..."
                  className="w-full bg-[#04040a] border border-[#00ffff]/40 p-3 font-tech text-sm text-[#00ffff] focus:outline-none focus:border-[#ff007f]"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="text-[#ff007f] font-tech text-xs">
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3.5 border-2 border-[#ff007f] bg-[#ff007f] text-[#000] font-pixel text-xs tracking-wider uppercase hover:bg-transparent hover:text-[#ff007f] transition-all"
              >
                [UNLOCK WITH PASSCODE]
              </button>
            </form>
          )}

          {/* Google Fast Login Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#00ffff]/20"></div>
            </div>
            <span className="relative px-3 bg-[#070716] font-tech text-[10px] text-[#ff007f]">
              // ATAU LOG MASUK GUNA GOOGLE //
            </span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={loginLoading}
            className="w-full py-3 border border-[#00ffff] bg-[#00ffff]/10 font-tech text-xs text-[#00ffff] hover:bg-[#00ffff]/20 transition-colors flex items-center justify-center gap-2"
          >
            <Cpu className="w-4 h-4 text-[#00ffff]" />
            <span>SIGN IN WITH GOOGLE ({ADMIN_PRIMARY_EMAIL})</span>
          </button>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="space-y-8">
          {/* Active Operator Status Banner */}
          <div className="p-3 border border-[#00ffff]/40 bg-[#060614] font-tech text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#00ffff]">
              <span className="w-2 h-2 rounded-full bg-[#00ffff] animate-ping"></span>
              <span>OPERATOR CLEARANCE: ACTIVE</span>
              <span className="text-[#ffe600]">
                ({currentUser ? (currentUser.email || currentUser.displayName) : 'SYSOP PASSCODE 123'})
              </span>
            </div>
            <span className="font-pixel text-[10px] text-[#ff007f]">
              [LEVEL_4 SYSOP PRIVILEGES]
            </span>
          </div>

          {/* Telemetry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 border border-[#00ffff]/30 bg-[#060614] neon-box-cyan">
              <span className="font-tech text-xs text-[#00ffff]/60 block mb-1">TOTAL REGISTRATIONS</span>
              <div className="font-vt text-4xl sm:text-5xl text-[#00ffff]">{registrations.length}</div>
              <span className="font-tech text-[10px] text-[#00ffff]/40">Active Firestore docs</span>
            </div>

            <div className="p-5 border border-[#ff007f]/30 bg-[#060614] neon-box-magenta">
              <span className="font-tech text-xs text-[#ff007f]/60 block mb-1">TOTAL CHARITY POOL</span>
              <div className="font-vt text-4xl sm:text-5xl text-[#ff007f]">RM {totalFunds}</div>
              <span className="font-tech text-[10px] text-[#ff007f]/40">RM 50 * confirmed</span>
            </div>

            <div className="p-5 border border-[#ffe600]/30 bg-[#060614] neon-box-yellow">
              <span className="font-tech text-xs text-[#ffe600]/60 block mb-1">10KM DIVISIONS</span>
              <div className="font-vt text-4xl sm:text-5xl text-[#ffe600]">{countVeteran + countOpen}</div>
              <span className="font-tech text-[10px] text-[#ffe600]/40">Vet: {countVeteran} | Open: {countOpen}</span>
            </div>

            <div className="p-5 border border-[#00ffff]/30 bg-[#060614] neon-box-cyan">
              <span className="font-tech text-xs text-[#00ffff]/60 block mb-1">5KM FUN RUN</span>
              <div className="font-vt text-4xl sm:text-5xl text-[#00ffff]">{countFun}</div>
              <span className="font-tech text-[10px] text-[#00ffff]/40">Neon Fun Division</span>
            </div>
          </div>

          {/* Filters & Search Control */}
          <div className="p-4 border border-[#00ffff]/30 bg-[#060612] flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[#00ffff]/40" />
              <input 
                type="text" 
                placeholder="Search participant, email, bib..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#04040a] border border-[#00ffff]/40 pl-9 pr-3 py-2 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1 font-tech text-xs text-[#00ffff]/70">
                <span>TIER:</span>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#04040a] border border-[#00ffff]/40 px-2.5 py-1.5 font-tech text-xs text-[#00ffff]"
                >
                  <option value="all">ALL TIERS</option>
                  <option value="10km_veteran">10 KM VETERAN</option>
                  <option value="10km_open">10 KM OPEN</option>
                  <option value="5km_fun">5 KM FUN</option>
                </select>
              </div>

              <div className="flex items-center gap-1 font-tech text-xs text-[#00ffff]/70">
                <span>STATUS:</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#04040a] border border-[#00ffff]/40 px-2.5 py-1.5 font-tech text-xs text-[#00ffff]"
                >
                  <option value="all">ALL STATES</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Participant Table */}
          <div className="border border-[#00ffff]/30 bg-[#060612] overflow-x-auto">
            <table className="w-full text-left font-tech text-xs">
              <thead className="bg-[#0c0c20] border-b border-[#00ffff]/30 text-[#00ffff]">
                <tr>
                  <th className="p-4 font-pixel tracking-wider">BIB #</th>
                  <th className="p-4 font-pixel tracking-wider">NAME</th>
                  <th className="p-4 font-pixel tracking-wider">EMAIL</th>
                  <th className="p-4 font-pixel tracking-wider">CATEGORY</th>
                  <th className="p-4 font-pixel tracking-wider">JERSEY</th>
                  <th className="p-4 font-pixel tracking-wider">FEE (RM)</th>
                  <th className="p-4 font-pixel tracking-wider">EMERGENCY</th>
                  <th className="p-4 font-pixel tracking-wider">STATUS</th>
                  <th className="p-4 font-pixel tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ffff]/10">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-[#00ffff]/50">
                      [NO PARTICIPANT RECORDS MATCH FILTER]
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((runner) => {
                    const isBusy = actionLoadingId === runner.id;
                    return (
                      <tr key={runner.id} className="hover:bg-[#00ffff]/5 transition-colors">
                        <td className="p-4 font-pixel text-[#ffe600] font-bold">
                          {runner.bibNumber}
                        </td>
                        <td className="p-4 text-[#00ffff] font-medium">
                          {runner.fullName}
                        </td>
                        <td className="p-4 text-[#00ffff]/70 truncate max-w-[150px]">
                          {runner.email}
                        </td>
                        <td className="p-4 text-[#00ffff]/80 uppercase">
                          {runner.category.replace('_', ' ')}
                        </td>
                        <td className="p-4 text-[#ff007f]">
                          {runner.tshirtSize || 'M'}
                        </td>
                        <td className="p-4 text-[#00ffff]">
                          50.00
                        </td>
                        <td className="p-4 text-[#00ffff]/60 truncate max-w-[120px]">
                          {runner.emergencyContact || 'N/A'}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(runner)}
                            disabled={isBusy}
                            title="Click to toggle status"
                            className={`px-2 py-0.5 font-pixel text-[10px] cursor-pointer hover:opacity-80 transition-opacity ${
                              runner.status === 'confirmed'
                                ? 'bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]'
                                : 'bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]'
                            }`}
                          >
                            {runner.status.toUpperCase()}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(runner.id, runner.fullName)}
                            disabled={isBusy}
                            title="Delete Record"
                            className="text-[#ff007f]/80 hover:text-[#ff007f] p-1 border border-transparent hover:border-[#ff007f] transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
