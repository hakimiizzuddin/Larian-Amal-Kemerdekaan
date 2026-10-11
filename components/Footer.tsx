import React from 'react';
import { Terminal, Shield, Zap, Radio } from 'lucide-react';

interface FooterProps {
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  return (
    <footer className="bg-[#04040a] text-[#00ffff] border-t-2 border-[#00ffff]/30 py-16 px-4 md:px-8 relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ffff] via-[#ffe600] to-[#ff007f]"></div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 font-tech">
        {/* Brand Col */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-[#ff007f] bg-[#ff007f]/20 flex items-center justify-center font-pixel text-[10px] text-[#ff007f]">
              M
            </div>
            <h3 className="font-pixel text-xl text-[#00ffff] glitch-text">
              LARIAN AMAL MERDEKA // 31.08
            </h3>
          </div>
          <p className="text-xs text-[#00ffff]/70 max-w-md leading-relaxed">
            TRANSMITTING NATIONAL UNITY ACROSS CYBER-SECTOR KL. CELEBRATING 69 CYCLES OF SOVEREIGNTY (1957 &#10142; 2026). POWERED BY CLOUD FIRESTORE IMMUTABLE TELEMETRY.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#ffe600] border border-[#ffe600]/30 bg-[#ffe600]/5 px-3 py-1.5 w-fit">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>TRANSMISSION BEACON: 100% CHARITY PROCEEDS DELIVERED</span>
          </div>
        </div>

        {/* Navigation Col */}
        <div>
          <h4 className="font-pixel text-xs text-[#ff007f] uppercase tracking-wider mb-4">
            [CIRCUIT NODES]
          </h4>
          <ul className="space-y-2 text-xs text-[#00ffff]/80">
            <li>
              <a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-[#ff007f] transition-colors">
                // MISSION & VENUE
              </a>
            </li>
            <li>
              <a href="#tiers" onClick={(e) => onLinkClick(e, 'tiers')} className="hover:text-[#ff007f] transition-colors">
                // RUN CATEGORIES (10K / 5K)
              </a>
            </li>
            <li>
              <a href="#registry" onClick={(e) => onLinkClick(e, 'registry')} className="hover:text-[#ff007f] transition-colors">
                // PARTICIPANT LEDGER
              </a>
            </li>
            <li>
              <a href="#register" onClick={(e) => onLinkClick(e, 'register')} className="hover:text-[#ff007f] transition-colors">
                // BIOMETRIC REGISTRATION
              </a>
            </li>
          </ul>
        </div>

        {/* Security & System Info */}
        <div>
          <h4 className="font-pixel text-xs text-[#ff007f] uppercase tracking-wider mb-4">
            [SYS_INTEGRITY]
          </h4>
          <div className="space-y-2 text-xs text-[#00ffff]/70">
            <div>FIRESTORE: <span className="text-[#00ffff]">ENTERPRISE EDITION</span></div>
            <div>RULES: <span className="text-[#ffe600]">ZERO-TRUST HARMONIZED</span></div>
            <div>LOCATION: <span className="text-[#00ffff]">DATARAN MERDEKA</span></div>
            <div>TIME: <span className="text-[#00ffff]">06:30 AM MYT // 31.08</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-12 pt-6 border-t border-[#00ffff]/10 flex flex-col md:flex-row justify-between items-center gap-4 font-tech text-xs text-[#00ffff]/50">
        <div>
          &copy; 2026 LARIAN AMAL MERDEKA. QUANTUM CITIZEN COLLECTIVE. ALL RIGHTS SECURED.
        </div>
        <div className="flex items-center gap-4 text-[#ff007f]">
          <span>[SYSTEM: ENCRYPTED]</span>
          <span>[CYBER_KL]</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
