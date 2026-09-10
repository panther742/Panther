import React, { useState } from 'react';
import { PantherLogo } from './PantherLogo';
import { ActiveView } from '../types';
import { Instagram, Linkedin, ExternalLink, ShieldCheck, Info, X, Sparkles, Layers, Palette, Grid, Type } from 'lucide-react';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const formats = ['SVG', 'DXF', 'EPS', 'PDF', 'CDR', 'PNG', 'JSON', 'ASE', 'GPL'];

  return (
    <>
      <footer className="relative bg-[#060B16]/95 backdrop-blur-xl border-t border-[#00D8FF]/20 text-slate-400 pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#00D8FF]/50 to-transparent" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00D8FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* LEFT SIDE: BRAND, DESC, COPYRIGHT, VERSION */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3.5">
              <PantherLogo size={42} />
              <div>
                <span className="font-extrabold text-2xl text-white tracking-tight block">
                  Panther <span className="text-[#00D8FF]">Studio</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9D4E5]/60 block">
                  Futuristic AI Creative Suite
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Premier AI-powered platform for graphic designers, vector artists, typography masters, brand agencies, and creative operators worldwide.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30">
                  Version 2.5.0 Pro
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-[#5FFFF7] border border-[#00D8FF]/30">
                  <ShieldCheck className="w-3 h-3 text-[#00D8FF]" />
                  <span>Production Ready</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                © {new Date().getFullYear()} Panther Studio. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* CENTER: QUICK LINKS & SUPPORTED FORMATS */}
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* QUICK LINKS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D8FF] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Links</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => {
                      setActiveView('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#00D8FF] transition-colors flex items-center gap-2 text-slate-300"
                    id="footer-home-link"
                  >
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveView('color-studio');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#00D8FF] transition-colors flex items-center gap-2 text-slate-300"
                    id="footer-color-studio-link"
                  >
                    <span>AI Color Studio</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveView('vector-studio');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#00D8FF] transition-colors flex items-center gap-2 text-slate-300"
                    id="footer-vector-studio-link"
                  >
                    <span>Image to Vector</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveView('image-studio');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#00D8FF] transition-colors flex items-center gap-2 text-slate-300"
                    id="footer-image-studio-link"
                  >
                    <span>AI Image Generator</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveView('future-tools');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#00D8FF] transition-colors flex items-center gap-2 text-slate-300"
                    id="footer-coming-soon-link"
                  >
                    <span>Coming Soon</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsAboutModalOpen(true)}
                    className="hover:text-[#00D8FF] transition-colors flex items-center gap-2 text-slate-300"
                    id="footer-about-link"
                  >
                    <span>About</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* SUPPORTED FORMATS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D8FF]">
                Supported Formats
              </h4>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.03] border border-[#00D8FF]/15 text-slate-200 font-semibold hover:border-[#00D8FF] hover:bg-[#00D8FF]/10 hover:text-[#00D8FF] transition-all cursor-default"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: FOLLOW PANTHER STUDIO (SOCIALS) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D8FF]">
              Follow Panther Studio
            </h4>

            <div className="space-y-3">
              {/* INSTAGRAM */}
              <a
                href="https://instagram.com/panther74_"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 rounded-2xl bg-white/[0.03] border border-[#00D8FF]/20 hover:border-[#00D8FF] hover:bg-[#00D8FF]/10 transition-all duration-300 flex items-center justify-between text-slate-200 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-[#00D8FF] to-[#007BFF] text-black font-bold group-hover:scale-110 transition-transform">
                    <Instagram className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white group-hover:text-[#00D8FF] transition-colors">
                      Instagram
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">@panther74_</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#00D8FF] transition-colors" />
              </a>

              {/* LINKEDIN */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-[#00D8FF]/15 flex items-center justify-between text-slate-300 opacity-80 hover:opacity-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">LinkedIn</span>
                    <span className="text-[10px] text-[#5FFFF7] font-mono">Official Page</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#00D8FF]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="flex items-center gap-2">
            <span>Crafted with Electric Blue AI Precision for Panther Studio</span>
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>System Status: Operational</span>
          </div>
        </div>
      </footer>

      {/* ABOUT MODAL */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0E1628] border border-[#00D8FF]/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-[#00D8FF]/20">
              <div className="flex items-center gap-3">
                <PantherLogo size={36} />
                <h3 className="text-xl font-bold text-white">About Panther Studio</h3>
              </div>
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <p>
                Panther Studio is an elite, high-performance creative suite engineered for digital artists, print houses, signmakers, laser operators, and brand agencies.
              </p>
              <div className="p-4 rounded-2xl bg-[#060B16] border border-[#00D8FF]/20 space-y-2 font-mono">
                <p className="text-[#00D8FF] font-bold">Key Capabilities:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Panther Typo Studio (1500+ Google Fonts, AI Pairings, Multi-View Mockups)</li>
                  <li>Panther Color Harmony Engine (360° Interactive Canvas Wheel)</li>
                  <li>Panther Vector Studio (Image to Vector Vectorizer)</li>
                  <li>AI Image Studio (Diffusion, Upscaler & Adapters)</li>
                </ul>
              </div>
              <p className="text-[11px] text-slate-400">
                Created and curated by Panther Studio (@panther74_).
              </p>
            </div>

            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-xs transition-all shadow-lg shadow-[#00D8FF]/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};


