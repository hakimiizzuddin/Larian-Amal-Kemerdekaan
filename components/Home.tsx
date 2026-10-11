import React, { useState, useEffect } from 'react';
import { 
  RUN_CATEGORIES, 
  CHARITY_BENEFICIARIES, 
  EVENT_SCHEDULE, 
  TARGET_FUNDS 
} from '../constants';
import { Registration, RunCategory, TShirtSize } from '../types';
import { registerRunner, generateBibCode, seedInitialRegistrations } from '../services/registrationService';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { 
  Zap, 
  Shield, 
  Activity, 
  Search, 
  Ticket, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Heart, 
  ChevronRight,
  Flame,
  UserCheck,
  Printer,
  Key,
  Database
} from 'lucide-react';
import { AuthModal } from './AuthModal';

interface HomeProps {
  registrations: Registration[];
}

const Home: React.FC<HomeProps> = ({ registrations }) => {
  // Registration form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<RunCategory>('10km_open');
  const [tshirtSize, setTshirtSize] = useState<TShirtSize>('M');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredDoc, setRegisteredDoc] = useState<Registration | null>(null);

  // Live registry search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Merdeka Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Fill user info if authenticated
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (currentUser.displayName && !fullName) setFullName(currentUser.displayName);
      if (currentUser.email && !email) setEmail(currentUser.email);
    }
  }, [fullName, email]);

  useEffect(() => {
    const calculateCountdown = () => {
      // 31 August 2026 06:30:00
      const targetDate = new Date('2026-08-31T06:30:00').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed');
  const totalFunds = confirmedRegistrations.length * 50;
  const progressPercent = Math.min(100, Math.round((totalFunds / TARGET_FUNDS) * 100));

  const predictedBib = generateBibCode(registrations.length, category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      if (!fullName.trim() || fullName.length < 2) {
        throw new Error('Full Name must contain at least 2 alphanumeric characters.');
      }
      if (!email.trim() || !email.includes('@')) {
        throw new Error('Please input a valid transmission electronic mail address.');
      }

      const newRegistration = await registerRunner({
        fullName,
        email,
        category,
        tshirtSize,
        emergencyContact,
        bibNumber: predictedBib,
      });

      setRegisteredDoc(newRegistration);
    } catch (err: any) {
      console.error('[REGISTRATION_ERROR]', err);
      setSubmitError(err.message || 'Quantum transaction failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintBib = () => {
    window.print();
  };

  // Filtered registry list
  const filteredRunners = registrations.filter((r) => {
    const matchesSearch = 
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bibNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full relative overflow-hidden">
      {/* CRT Scanline & Grain Overlay */}
      <div className="fixed inset-0 crt-overlay pointer-events-none z-30"></div>

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center pt-28 pb-16 px-4 md:px-8 bg-[#05050a] border-b border-[#00ffff]/20">
        <div className="absolute inset-0 glitch-noise pointer-events-none"></div>

        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff08_1px,transparent_1px),linear-gradient(to_bottom,#ff007f08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Cyber Status Banner */}
          <div className="inline-flex items-center gap-2 border border-[#ff007f]/40 bg-[#ff007f]/10 px-4 py-1.5 mb-6 text-xs font-tech tracking-widest text-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#ff007f] animate-ping"></span>
            <span>TRANSMISSION: MERDEKA 1957 &#10142; 3026 // CYBER_CHARITY CIRCUIT</span>
          </div>

          {/* Glitch Title */}
          <h1 className="font-pixel text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#00ffff] mb-6 glitch-text leading-none">
            LARIAN AMAL
            <span className="block text-[#ff007f] text-3xl sm:text-5xl md:text-7xl mt-2">
              MERDEKA
            </span>
          </h1>

          {/* Machine Tone Description */}
          <p className="font-tech text-base sm:text-lg md:text-xl text-[#00ffff]/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            RE-ENGAGE THE NATIONAL CADENCE. ON <span className="text-[#ffe600] font-pixel">31 AUGUST</span>, THOUSANDS OF BIOMETRIC RUNNERS WILL CONVERGE AT DATARAN MERDEKA. 100% OF NET PROCEEDS SYNC DIRECTLY TO CHARITY VETERANS, ASNAF EDUCATION, AND RAINFOREST CONSERVATION.
          </p>

          {/* Glitch Countdown Matrix */}
          <div className="mb-10 p-4 border border-[#00ffff]/30 bg-[#080814]/90 max-w-2xl mx-auto neon-box-cyan">
            <div className="text-[10px] font-pixel text-[#ff007f] uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>TIME DELTA UNTIL QUANTUM FLAG-OFF [31.08]</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="border border-[#00ffff]/20 bg-[#04040a] p-3">
                <div className="font-vt text-4xl sm:text-5xl text-[#00ffff] leading-none">{timeLeft.days}</div>
                <div className="font-tech text-[10px] text-[#ff007f] uppercase tracking-wider">DAYS</div>
              </div>
              <div className="border border-[#00ffff]/20 bg-[#04040a] p-3">
                <div className="font-vt text-4xl sm:text-5xl text-[#00ffff] leading-none">{timeLeft.hours}</div>
                <div className="font-tech text-[10px] text-[#ff007f] uppercase tracking-wider">HOURS</div>
              </div>
              <div className="border border-[#00ffff]/20 bg-[#04040a] p-3">
                <div className="font-vt text-4xl sm:text-5xl text-[#00ffff] leading-none">{timeLeft.minutes}</div>
                <div className="font-tech text-[10px] text-[#ff007f] uppercase tracking-wider">MINS</div>
              </div>
              <div className="border border-[#00ffff]/20 bg-[#04040a] p-3">
                <div className="font-vt text-4xl sm:text-5xl text-[#ffe600] leading-none animate-pulse">{timeLeft.seconds}</div>
                <div className="font-tech text-[10px] text-[#ffe600] uppercase tracking-wider">SECS</div>
              </div>
            </div>
          </div>

          {/* Primary Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#register" 
              className="w-full sm:w-auto px-8 py-4 border-2 border-[#00ffff] bg-[#00ffff] text-[#000000] font-pixel text-sm tracking-widest hover:bg-[#ff007f] hover:border-[#ff007f] hover:text-[#ffffff] transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>[INITIALIZE_REGISTRATION // RM50]</span>
            </a>
            <a 
              href="#registry" 
              className="w-full sm:w-auto px-8 py-4 border border-[#ff007f] bg-[#ff007f]/10 text-[#ff007f] font-pixel text-sm tracking-widest hover:bg-[#ff007f]/20 hover:text-[#ffffff] transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>[QUERY_BIB_REGISTRY]</span>
            </a>
          </div>
        </div>
      </section>

      {/* Live Telemetry Bar */}
      <section className="py-10 px-4 md:px-8 bg-[#090914] border-b border-[#00ffff]/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Metric 1 */}
            <div className="p-6 border border-[#00ffff]/30 bg-[#04040a] neon-box-cyan">
              <div className="flex items-center justify-between text-xs font-tech text-[#00ffff]/70 mb-2">
                <span>TOTAL REGISTERED NODES</span>
                <Activity className="w-4 h-4 text-[#00ffff] animate-pulse" />
              </div>
              <div className="font-vt text-5xl md:text-6xl text-[#00ffff] leading-none">
                {confirmedRegistrations.length}
              </div>
              <div className="font-tech text-xs text-[#00ffff]/60 mt-2">
                Synced with Firestore database
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-6 border border-[#ff007f]/30 bg-[#04040a] neon-box-magenta">
              <div className="flex items-center justify-between text-xs font-tech text-[#ff007f]/70 mb-2">
                <span>CHARITY FUNDS ACCUMULATED</span>
                <Heart className="w-4 h-4 text-[#ff007f] animate-bounce" />
              </div>
              <div className="font-vt text-5xl md:text-6xl text-[#ff007f] leading-none">
                RM {totalFunds.toLocaleString()}
              </div>
              <div className="font-tech text-xs text-[#ff007f]/60 mt-2">
                Fixed RM 50 contribution / registrant
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-6 border border-[#ffe600]/30 bg-[#04040a] neon-box-yellow">
              <div className="flex items-center justify-between text-xs font-tech text-[#ffe600]/70 mb-2">
                <span>BENEVOLENCE TARGET PROGRESS</span>
                <Flame className="w-4 h-4 text-[#ffe600]" />
              </div>
              <div className="font-vt text-5xl md:text-6xl text-[#ffe600] leading-none">
                {progressPercent}%
              </div>
              <div className="font-tech text-xs text-[#ffe600]/60 mt-2">
                Target: RM {TARGET_FUNDS.toLocaleString()} pool
              </div>
            </div>
          </div>

          {/* Progress Gauge */}
          <div className="border border-[#00ffff]/20 bg-[#040408] p-4">
            <div className="flex justify-between items-center text-xs font-tech mb-2">
              <span className="text-[#00ffff]">CHARITY ALLOCATION PROGRESSION</span>
              <span className="text-[#ffe600]">RM {totalFunds.toLocaleString()} / RM {TARGET_FUNDS.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-[#0a0a18] border border-[#00ffff]/30 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00ffff] via-[#ffe600] to-[#ff007f] transition-all duration-1000 shadow-[0_0_10px_#00ffff]"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Route Specs */}
      <section id="about" className="py-24 px-4 md:px-8 max-w-6xl mx-auto border-b border-[#00ffff]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-[#00ffff] animate-ping"></div>
          <span className="font-tech text-xs tracking-widest text-[#00ffff] uppercase">// SYSTEM SPECIFICATION // SECTOR 01</span>
        </div>
        <h2 className="font-pixel text-3xl sm:text-5xl text-[#00ffff] mb-8 glitch-text">
          A HERITAGE OF UNBROKEN FREEDOM
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 font-tech text-base text-[#00ffff]/80 leading-relaxed">
            <p>
              SINCE 1957, MERDEKA HAS SIGNIFIED SELF-DETERMINATION, COLLECTIVE VALOR, AND HARMONY. THE 2026 LARIAN AMAL MERDEKA UPGRADES THIS LEGACY INTO A TANGIBLE SOLIDARITY GRID.
            </p>
            <p>
              WE COMMEMORATE 69 CYCLES OF INDEPENDENCE THROUGH HEALTH, COMMUNITY CAMARADERIE, AND SYSTEMIC CHARITABLE DISPATCH. EACH RUNNER REGISTRATION CREATES A PERMANENT PARTICIPATION RECORD IN OUR QUANTUM FIRESTORE REPOSITORY.
            </p>
            <div className="p-4 border border-[#ff007f]/40 bg-[#ff007f]/5 font-tech text-xs text-[#ff007f] space-y-1">
              <div>// PROTOCOL VENUE: DATARAN MERDEKA, KUALA LUMPUR</div>
              <div>// GPS COORDINATES: 3.1492° N, 101.6938° E</div>
              <div>// CIRCUIT SURFACE: HERITAGE ASPHALT & URBAN CORRIDOR</div>
            </div>
          </div>

          <div className="border-2 border-[#00ffff] bg-[#0c0c1e] p-6 neon-box-cyan relative">
            <div className="absolute top-2 right-2 text-[10px] font-pixel text-[#ff007f]">[EVENT TIMELINE]</div>
            <h3 className="font-pixel text-lg text-[#00ffff] mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ffe600]" />
              <span>OPERATIONAL CADENCE (31.08)</span>
            </h3>
            <div className="space-y-4 font-tech text-xs">
              {EVENT_SCHEDULE.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 border-b border-[#00ffff]/10 pb-3">
                  <span className="font-pixel text-[#ffe600] shrink-0">{item.time}</span>
                  <span className="text-[#00ffff]/90">{item.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection Matrix */}
      <section id="tiers" className="py-24 px-4 md:px-8 max-w-6xl mx-auto border-b border-[#00ffff]/20">
        <div className="text-center mb-16">
          <div className="font-tech text-xs tracking-widest text-[#ff007f] uppercase mb-2">// SELECTION PROTOCOL</div>
          <h2 className="font-pixel text-3xl sm:text-5xl text-[#00ffff] glitch-text">
            CHOOSE YOUR RUNNING DISTANCE
          </h2>
          <p className="font-tech text-sm text-[#00ffff]/70 max-w-xl mx-auto mt-3">
            ALL TIERS INCLUDE COMPLETE EVENT PACK, COMMEMORATIVE MERDEKA MEDAL, AND CHARITY CONTRIBUTION.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {RUN_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <div 
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  const el = document.getElementById('register');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`border-2 p-6 transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected 
                    ? 'border-[#00ffff] bg-[#0c0c20] neon-box-cyan' 
                    : 'border-[#00ffff]/30 bg-[#060610] hover:border-[#ff007f] hover:bg-[#090918]'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-2 py-0.5 bg-[#00ffff] text-[#000] font-pixel text-[9px] tracking-wider">
                    SELECTED TIER
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-pixel text-xs text-[#ffe600]">{cat.code}</span>
                    <span className="font-tech text-xs text-[#00ffff]/60">FLAG-OFF: {cat.flagOffTime}</span>
                  </div>

                  <h3 className="font-pixel text-xl text-[#00ffff] mb-2 group-hover:text-[#ff007f] transition-colors">
                    {cat.name}
                  </h3>

                  <div className="font-vt text-4xl text-[#ffe600] mb-4">
                    RM {cat.fee}.00
                  </div>

                  <p className="font-tech text-xs text-[#00ffff]/80 mb-6 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="space-y-2 mb-6 font-tech text-xs text-[#00ffff]/70 border-t border-[#00ffff]/20 pt-4">
                    {cat.perks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <span className="text-[#ff007f]">&#9658;</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="button"
                  className={`w-full py-3 font-pixel text-xs tracking-wider transition-all border ${
                    isSelected 
                      ? 'border-[#00ffff] bg-[#00ffff] text-[#000]' 
                      : 'border-[#ff007f] text-[#ff007f] hover:bg-[#ff007f] hover:text-[#000]'
                  }`}
                >
                  {isSelected ? '[READY TO REGISTER]' : '[SELECT TIER]'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Runner Registry Terminal (Direct Firestore Sync) */}
      <section id="registry" className="py-24 px-4 md:px-8 max-w-6xl mx-auto border-b border-[#00ffff]/20">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-4 h-4 text-[#00ffff]" />
            <span className="font-tech text-xs tracking-widest text-[#00ffff] uppercase">// FIRESTORE REPOSITORY QUERY</span>
          </div>
          <h2 className="font-pixel text-3xl sm:text-5xl text-[#00ffff] glitch-text">
            PARTICIPANT LEDGER & BIB LOOKUP
          </h2>
          <p className="font-tech text-sm text-[#00ffff]/70 mt-2">
            ALL VERIFIED RUNNERS LOGGED IN FIRESTORE ARE BROADCASTED BELOW IN REAL TIME.
          </p>
        </div>

        {/* If database is empty, provide immediate test seeding */}
        {registrations.length === 0 && (
          <div className="mb-6 p-4 border border-[#00ffff] bg-[#00ffff]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-tech">
            <div className="flex items-center gap-2 text-[#00ffff]">
              <Database className="w-4 h-4 text-[#ffe600] animate-bounce shrink-0" />
              <span>
                <b>FIRESTORE ONLINE:</b> Database terhubung dengan jaya! Belum ada rekod peserta.
              </span>
            </div>
            <button 
              type="button"
              onClick={async () => {
                await seedInitialRegistrations();
              }}
              className="px-4 py-2 border border-[#ffe600] bg-[#ffe600] text-[#000] font-pixel text-[10px] hover:bg-[#ff007f] hover:text-[#fff] hover:border-[#ff007f] transition-all tracking-wider shadow-[0_0_10px_rgba(255,230,0,0.3)] shrink-0"
            >
              [UJI TULIS: SEED 3 PESERTA KE FIRESTORE]
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 border border-[#00ffff]/30 bg-[#080816] mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#00ffff]/50" />
            <input 
              type="text" 
              placeholder="Search by Name or Bib (LAM-XXX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#04040a] border border-[#00ffff]/40 pl-10 pr-4 py-2 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-tech text-xs text-[#00ffff]/60">CATEGORY:</span>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#04040a] border border-[#00ffff]/40 px-3 py-2 font-tech text-xs text-[#00ffff] focus:outline-none focus:border-[#ff007f] cursor-pointer"
            >
              <option value="all">ALL TIERS</option>
              <option value="10km_veteran">10 KM VETERAN</option>
              <option value="10km_open">10 KM OPEN</option>
              <option value="5km_fun">5 KM FUN RUN</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-[#00ffff]/30 bg-[#060612] overflow-x-auto">
          {filteredRunners.length === 0 ? (
            <div className="p-12 text-center font-tech text-sm text-[#00ffff]/60">
              [NO RUNNER NODES MATCH THE CURRENT FILTER QUERY]
            </div>
          ) : (
            <table className="w-full text-left font-tech text-xs">
              <thead className="bg-[#0c0c20] border-b border-[#00ffff]/30 text-[#00ffff]">
                <tr>
                  <th className="p-4 font-pixel tracking-wider">BIB NUMBER</th>
                  <th className="p-4 font-pixel tracking-wider">RUNNER IDENTIFIER</th>
                  <th className="p-4 font-pixel tracking-wider">DIVISION</th>
                  <th className="p-4 font-pixel tracking-wider">APPAREL</th>
                  <th className="p-4 font-pixel tracking-wider">STATUS</th>
                  <th className="p-4 font-pixel tracking-wider">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ffff]/10">
                {filteredRunners.map((runner) => (
                  <tr key={runner.id} className="hover:bg-[#00ffff]/5 transition-colors">
                    <td className="p-4 font-pixel text-[#ffe600] font-bold">
                      {runner.bibNumber}
                    </td>
                    <td className="p-4 text-[#00ffff] font-medium">
                      {runner.fullName}
                    </td>
                    <td className="p-4 text-[#00ffff]/80 uppercase">
                      {runner.category.replace('_', ' ')}
                    </td>
                    <td className="p-4 text-[#ff007f]">
                      {runner.tshirtSize || 'M'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 font-pixel text-[10px] ${
                        runner.status === 'confirmed' 
                          ? 'bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]' 
                          : 'bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]'
                      }`}>
                        {runner.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-[#00ffff]/50">
                      {new Date(runner.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-24 px-4 md:px-8 max-w-4xl mx-auto border-b border-[#00ffff]/20">
        <div className="text-center mb-12">
          <div className="font-tech text-xs tracking-widest text-[#ff007f] uppercase mb-2">// BIOMETRIC TERMINAL INITIALIZATION</div>
          <h2 className="font-pixel text-3xl sm:text-5xl text-[#00ffff] glitch-text">
            RUNNER REGISTRATION INTERFACE
          </h2>
          <p className="font-tech text-sm text-[#00ffff]/70 mt-2">
            TRANSMIT YOUR PARTICIPANT RECORD TO THE LARIAN AMAL MERDEKA FIRESTORE LEDGER.
          </p>
        </div>

        {registeredDoc ? (
          /* Digital Bib Ticket Issued */
          <div className="p-8 border-2 border-[#00ffff] bg-[#070718] neon-box-cyan text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00ffff]/10 border border-[#00ffff] text-[#00ffff] font-pixel text-xs mb-6">
              <CheckCircle className="w-4 h-4 text-[#00ffff]" />
              <span>REGISTRATION CONFIRMED // BIB ISSUED</span>
            </div>

            {/* Cyber Bib Card */}
            <div className="max-w-md mx-auto p-6 border-4 border-[#ff007f] bg-[#04040a] text-left relative overflow-hidden mb-8 shadow-[0_0_30px_rgba(255,0,127,0.3)]">
              <div className="flex justify-between items-start border-b-2 border-[#ff007f] pb-3 mb-4">
                <div>
                  <div className="font-pixel text-xs text-[#00ffff]">LARIAN AMAL MERDEKA</div>
                  <div className="font-tech text-[10px] text-[#ff007f]">31 AUGUST 2026 // DATARAN MERDEKA</div>
                </div>
                <div className="font-pixel text-xs text-[#ffe600]">
                  RM 50.00 PAID
                </div>
              </div>

              <div className="text-center my-6">
                <div className="font-tech text-xs text-[#00ffff]/60 uppercase">OFFICIAL RUNNER BIB</div>
                <div className="font-pixel text-5xl md:text-6xl text-[#00ffff] tracking-widest glitch-text my-2">
                  {registeredDoc.bibNumber}
                </div>
                <div className="font-pixel text-sm text-[#ffe600] uppercase">
                  {registeredDoc.fullName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#00ffff]/30 pt-4 font-tech text-xs">
                <div>
                  <span className="text-[#00ffff]/50 block">CATEGORY:</span>
                  <span className="text-[#00ffff] font-bold uppercase">{registeredDoc.category.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[#00ffff]/50 block">APPAREL SIZE:</span>
                  <span className="text-[#ff007f] font-bold">{registeredDoc.tshirtSize}</span>
                </div>
                <div>
                  <span className="text-[#00ffff]/50 block">EMAIL DISPATCH:</span>
                  <span className="text-[#00ffff] truncate block">{registeredDoc.email}</span>
                </div>
                <div>
                  <span className="text-[#00ffff]/50 block">BEACON CONTACT:</span>
                  <span className="text-[#00ffff]">{registeredDoc.emergencyContact || 'N/A'}</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="mt-6 pt-4 border-t-2 border-[#ff007f] flex flex-col items-center">
                <div className="w-full h-10 bg-[repeating-linear-gradient(90deg,#00ffff,#00ffff_2px,#000_2px,#000_6px,#00ffff_6px,#00ffff_8px,#000_8px,#000_12px)] opacity-80"></div>
                <span className="font-tech text-[9px] text-[#00ffff]/50 mt-1 tracking-widest">{registeredDoc.id}</span>
              </div>
            </div>

            <p className="font-tech text-sm text-[#00ffff]/80 max-w-lg mx-auto mb-8">
              A CONFIRMATION BEACON HAS BEEN LOGGED. PLEASE PRESENT THIS BIB TICKET DURING RACE PACK COLLECTION AT DATARAN MERDEKA.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handlePrintBib}
                className="w-full sm:w-auto px-6 py-3 border border-[#00ffff] bg-[#00ffff] text-[#000] font-pixel text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-[#ff007f] hover:border-[#ff007f] hover:text-[#fff] transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>[PRINT / SAVE BIB TICKET]</span>
              </button>
              <button 
                onClick={() => {
                  setRegisteredDoc(null);
                  setFullName('');
                  setEmail('');
                  setEmergencyContact('');
                }}
                className="w-full sm:w-auto px-6 py-3 border border-[#ff007f] bg-transparent text-[#ff007f] font-pixel text-xs tracking-wider hover:bg-[#ff007f]/20 transition-colors"
              >
                [REGISTER ANOTHER RUNNER]
              </button>
            </div>
          </div>
        ) : (
          /* Registration Input Form */
          <form 
            onSubmit={handleSubmit}
            className="p-8 border-2 border-[#00ffff]/50 bg-[#070716] neon-box-cyan space-y-6"
          >
            {submitError && (
              <div className="p-4 border border-[#ff007f] bg-[#ff007f]/10 text-[#ff007f] font-tech text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Quick Auth Autofill helper if not logged in */}
            {!auth.currentUser && (
              <div className="p-4 border border-[#00ffff]/40 bg-[#04040c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-tech text-xs">
                <span className="text-[#00ffff]/80 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#00ffff]" />
                  <span>INGIN AUTOFILL BIOMETRIK? LOG MASUK EMAIL/PASSWORD ATAU GOOGLE:</span>
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="flex-1 sm:flex-none px-3 py-1.5 border border-[#00ffff] bg-[#00ffff]/10 text-[#00ffff] hover:bg-[#00ffff] hover:text-[#000] transition-colors font-pixel text-[10px]"
                  >
                    [EMAIL & PASSWORD DIRECT]
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await signInWithPopup(auth, googleProvider);
                        if (res.user.displayName) setFullName(res.user.displayName);
                        if (res.user.email) setEmail(res.user.email);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 border border-[#ff007f] text-[#ff007f] hover:bg-[#ff007f] hover:text-[#fff] transition-colors font-pixel text-[10px]"
                  >
                    [GOOGLE]
                  </button>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block font-pixel text-xs text-[#00ffff] uppercase mb-2">
                FULL RUNNER NAME <span className="text-[#ff007f]">*</span>
              </label>
              <input 
                type="text" 
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. MOHD KHALID BIN HASSAN"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#04040a] border border-[#00ffff]/40 p-3 font-tech text-sm text-[#00ffff] focus:outline-none focus:border-[#ff007f] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-pixel text-xs text-[#00ffff] uppercase mb-2">
                ELECTRONIC MAIL DISPATCH <span className="text-[#ff007f]">*</span>
              </label>
              <input 
                type="email" 
                required
                maxLength={120}
                placeholder="runner@example.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#04040a] border border-[#00ffff]/40 p-3 font-tech text-sm text-[#00ffff] focus:outline-none focus:border-[#ff007f] transition-colors"
              />
            </div>

            {/* Category & Apparel Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-pixel text-xs text-[#00ffff] uppercase mb-2">
                  RUN CATEGORY <span className="text-[#ff007f]">*</span>
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RunCategory)}
                  className="w-full bg-[#04040a] border border-[#00ffff]/40 p-3 font-tech text-sm text-[#00ffff] focus:outline-none focus:border-[#ff007f] cursor-pointer"
                >
                  <option value="10km_veteran">10 KM VETERAN (RM 50.00)</option>
                  <option value="10km_open">10 KM OPEN (RM 50.00)</option>
                  <option value="5km_fun">5 KM NEON FUN RUN (RM 50.00)</option>
                </select>
              </div>

              <div>
                <label className="block font-pixel text-xs text-[#00ffff] uppercase mb-2">
                  TECH-JERSEY SIZE
                </label>
                <select 
                  value={tshirtSize}
                  onChange={(e) => setTshirtSize(e.target.value as TShirtSize)}
                  className="w-full bg-[#04040a] border border-[#00ffff]/40 p-3 font-tech text-sm text-[#00ffff] focus:outline-none focus:border-[#ff007f] cursor-pointer"
                >
                  <option value="XS">XS (CHEST 36")</option>
                  <option value="S">S (CHEST 38")</option>
                  <option value="M">M (CHEST 40")</option>
                  <option value="L">L (CHEST 42")</option>
                  <option value="XL">XL (CHEST 44")</option>
                  <option value="2XL">2XL (CHEST 46")</option>
                </select>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block font-pixel text-xs text-[#00ffff] uppercase mb-2">
                EMERGENCY BEACON CONTACT & TELECOM
              </label>
              <input 
                type="text" 
                maxLength={60}
                placeholder="e.g. NURUL (SPOUSE) - +6012-3456789"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full bg-[#04040a] border border-[#00ffff]/40 p-3 font-tech text-sm text-[#00ffff] focus:outline-none focus:border-[#ff007f] transition-colors"
              />
            </div>

            {/* Cost & Assigned Sequence Preview */}
            <div className="border-t border-[#00ffff]/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#04040c] p-4">
              <div>
                <div className="font-tech text-xs text-[#00ffff]/60">NEXT ASSIGNED BIB TOKEN:</div>
                <div className="font-pixel text-lg text-[#ffe600]">{predictedBib}</div>
              </div>
              <div className="text-right">
                <div className="font-tech text-xs text-[#00ffff]/60">FIXED CHARITY CONTRIBUTION:</div>
                <div className="font-vt text-4xl text-[#00ffff] leading-none">RM 50.00</div>
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-5 border-2 border-[#00ffff] bg-[#00ffff] text-[#000] font-pixel text-sm tracking-widest uppercase hover:bg-[#ff007f] hover:border-[#ff007f] hover:text-[#fff] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            >
              {submitting ? '[TRANSMITTING RECORD TO FIRESTORE...]' : '[CONFIRM & WRITE TO FIRESTORE LEDGER]'}
            </button>
          </form>
        )}
      </section>

      {/* Charity Beneficiaries Showcase */}
      <section className="py-24 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="font-tech text-xs tracking-widest text-[#ff007f] uppercase mb-2">// BENEFICIARY DISPATCH MATRIX</div>
          <h2 className="font-pixel text-3xl sm:text-5xl text-[#00ffff] glitch-text">
            WHERE YOUR RM50 ENTRY GOES
          </h2>
          <p className="font-tech text-sm text-[#00ffff]/70 max-w-xl mx-auto mt-3">
            TRANSPARENT DISTRIBUTION OF EVERY RINGGIT COLLECTED TO AUTHORIZED PUBLIC FOUNDATIONS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CHARITY_BENEFICIARIES.map((item, idx) => (
            <div key={idx} className="border border-[#00ffff]/30 bg-[#070714] p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-pixel text-xs text-[#ffe600]">{item.share} ALLOCATION</span>
                  <Heart className="w-4 h-4 text-[#ff007f]" />
                </div>
                <h3 className="font-pixel text-base text-[#00ffff] mb-2">{item.name}</h3>
                <div className="font-tech text-xs text-[#ff007f] mb-4">{item.sector}</div>
                <p className="font-tech text-xs text-[#00ffff]/70 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
