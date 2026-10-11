import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Admin from './components/Admin';
import Home from './components/Home';
import Footer from './components/Footer';
import { ViewState, Registration } from './types';
import { subscribeToRegistrations } from './services/registrationService';
import { testConnection, FIRESTORE_DATABASE_ID } from './firebase';
import { Database, CheckCircle, Wifi, Radio } from 'lucide-react';

function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | undefined>(undefined);

  // Probe Firestore uplink
  useEffect(() => {
    testConnection().then((res) => {
      setDbConnected(res.connected);
      setLatency(res.latencyMs);
    });
  }, []);

  // Subscribe to real-time Firestore registrations
  useEffect(() => {
    const unsubscribe = subscribeToRegistrations(
      (data) => {
        setRegistrations(data);
        setFirestoreLoading(false);
      },
      (error) => {
        console.error('[FIRESTORE_SYNC_FAILURE]', error);
        setFirestoreLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (view.type !== 'home') {
      setView({ type: 'home' });
      setTimeout(() => scrollToSection(targetId), 50);
    } else {
      scrollToSection(targetId);
    }
  };

  const scrollToSection = (targetId: string) => {
    if (!targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] font-tech text-[#00ffff] selection:bg-[#ff007f] selection:text-[#000000]">
      {/* Top Cyber Telemetry Status Bar */}
      <div className="bg-[#030308] border-b border-[#00ffff]/20 px-4 py-1 text-[11px] font-tech flex flex-wrap items-center justify-between text-[#00ffff]/80 relative z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#00ffff]">
            <span className="w-2 h-2 rounded-full bg-[#00ffff] animate-ping"></span>
            <span className="font-pixel text-[9px] text-[#ffe600]">FIRESTORE UPLINK:</span>
            <span className="text-[#00ffff] font-bold">
              {dbConnected === null ? 'SYNCING...' : dbConnected ? 'CONNECTED (ONLINE)' : 'OFFLINE'}
            </span>
          </div>
          <span className="text-[#ff007f]/40 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1 text-[#00ffff]/70">
            <span>DATABASE:</span>
            <span className="text-[#ffe600] font-mono text-[10px]">{FIRESTORE_DATABASE_ID}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          {latency !== undefined && (
            <span className="text-[#00ffff]/60">PING: {latency}ms</span>
          )}
          <span className="text-[#ff007f]">REGION: asia-southeast1</span>
          <span className="text-[#ffe600] font-bold">RECORDS: {registrations.length}</span>
        </div>
      </div>

      <Navbar 
        onNavClick={handleNavClick} 
        onAdminClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setView({ type: 'admin' });
        }}
        registrations={registrations}
      />
      
      <main>
        {view.type === 'home' && (
          <Home registrations={registrations} />
        )}
        {view.type === 'admin' && (
          <Admin 
            onBack={() => setView({ type: 'home' })} 
            registrations={registrations}
          />
        )}
      </main>

      <Footer onLinkClick={handleNavClick} />
    </div>
  );
}

export default App;
