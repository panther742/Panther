import React, { useState } from 'react';
import { PantherLogo } from './PantherLogo';
import { ActiveView } from '../types';
import { AboutModal } from './AboutModal';
import { Palette, Layers, Type, Grid, Sparkles, Moon, Sun, Info, Image as ImageIcon, Settings, Languages, FileCode } from 'lucide-react';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  isDarkMode,
  setIsDarkMode,
}) => {
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const isHomePage = activeView === 'home';

  const prefetchView = (view: ActiveView) => {
    switch (view) {
      case 'typo-studio':
        import('./TypoStudio/TypoStudio');
        break;
      case 'color-studio':
        import('./ColorStudio/ColorStudio');
        break;
      case 'vector-studio':
        import('./VectorStudio/VectorStudio');
        break;
      case 'image-studio':
        import('./ImageStudio/ImageStudio');
        break;
      case 'script-studio':
        import('./ScriptStudio/ScriptStudio');
        break;
      case 'future-tools':
        import('./FutureTools');
        break;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#060B16]/90 border-b border-[#00D8FF]/30 text-slate-100 shadow-[0_4px_30px_rgba(0,216,255,0.12)] transition-colors duration-300 h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          {/* HOMEPAGE SPECIFIC LAYOUT */}
          {isHomePage ? (
            <div className="grid grid-cols-3 items-center h-full w-full">
              {/* LEFT SIDE: Home Button Only */}
              <div className="flex items-center justify-start">
                <button
                  onClick={() => setActiveView('home')}
                  id="nav-home-button-only"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-[#00D8FF] via-[#28B8FF] to-[#007BFF] text-black shadow-lg shadow-[#00D8FF]/25 hover:scale-[1.03] transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Home</span>
                </button>
              </div>

              {/* CENTER: Panther Studio Brand Identity */}
              <div className="flex items-center justify-center">
                <div
                  onClick={() => setActiveView('home')}
                  className="flex items-center gap-3.5 cursor-pointer group"
                  id="panther-studio-centered-logo"
                >
                  <PantherLogo size={48} />
                  <div className="flex flex-col items-start leading-none">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xl sm:text-[28px] tracking-tight text-white group-hover:text-[#00D8FF] transition-colors leading-none">
                        Panther <span className="text-[#00D8FF]">Studio</span>
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                        PRO
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-[13px] text-[#C9D4E5]/80 font-medium tracking-wide mt-1 whitespace-nowrap">
                      AI Design & Vector Platform
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Theme Toggle & Settings */}
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2.5 rounded-xl bg-[#0E1628] border border-[#00D8FF]/30 text-slate-300 hover:text-white hover:border-[#00D8FF] transition-all duration-200 shadow-md hover:scale-105"
                  title="Toggle Light / Dark Mode"
                  id="theme-toggle-button"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-[#00D8FF]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#00D8FF]" />
                  )}
                </button>

                <button
                  onClick={() => setIsAboutOpen(true)}
                  className="p-2.5 rounded-xl bg-[#0E1628] border border-[#00D8FF]/30 text-slate-300 hover:text-white hover:border-[#00D8FF] transition-all duration-200 shadow-md hover:scale-105"
                  title="Platform Settings & About"
                  id="settings-toggle-button"
                >
                  <Settings className="w-4 h-4 text-[#00D8FF]" />
                </button>
              </div>
            </div>
          ) : (
            /* TOOL PAGES FULL NAVIGATION HEADER */
            <div className="flex items-center justify-between h-full w-full">
              {/* Brand Identity */}
              <div
                onClick={() => setActiveView('home')}
                className="flex items-center gap-3 cursor-pointer group"
                id="panther-studio-logo-button"
              >
                <PantherLogo size={42} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#00D8FF] transition-colors">
                      Panther <span className="text-[#00D8FF]">Studio</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C9D4E5]/80 font-medium tracking-wide">
                    AI Design & Vector Platform
                  </p>
                </div>
              </div>

              {/* Navigation Tabs for Tools */}
              <nav className="hidden md:flex items-center gap-1 p-1.5 bg-[#0E1628]/80 backdrop-blur-xl rounded-2xl border border-[#00D8FF]/15 shadow-inner">
                <button
                  onClick={() => setActiveView('home')}
                  id="nav-home-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'home'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setActiveView('typo-studio')}
                  onMouseEnter={() => prefetchView('typo-studio')}
                  onFocus={() => prefetchView('typo-studio')}
                  id="nav-typo-studio-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'typo-studio'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Type className="w-3.5 h-3.5 text-[#00D8FF]" />
                  <span>Typo Studio</span>
                </button>

                <button
                  onClick={() => setActiveView('color-studio')}
                  onMouseEnter={() => prefetchView('color-studio')}
                  onFocus={() => prefetchView('color-studio')}
                  id="nav-color-studio-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'color-studio'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-[#00D8FF]" />
                  <span>AI Color Studio</span>
                </button>

                <button
                  onClick={() => setActiveView('vector-studio')}
                  onMouseEnter={() => prefetchView('vector-studio')}
                  onFocus={() => prefetchView('vector-studio')}
                  id="nav-vector-studio-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'vector-studio'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#00D8FF]" />
                  <span>Image to Vector</span>
                </button>

                <button
                  onClick={() => setActiveView('image-studio')}
                  onMouseEnter={() => prefetchView('image-studio')}
                  onFocus={() => prefetchView('image-studio')}
                  id="nav-image-studio-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'image-studio'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-[#C9D4E5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#00D8FF]" />
                  <span>AI Image Studio</span>
                </button>

                <button
                  onClick={() => setActiveView('script-studio')}
                  onMouseEnter={() => prefetchView('script-studio')}
                  onFocus={() => prefetchView('script-studio')}
                  id="nav-script-studio-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'script-studio'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-[#C9D4E5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5 text-[#00D8FF]" />
                  <span>Script Converter</span>
                </button>

                <button
                  onClick={() => setActiveView('psd-studio')}
                  id="nav-psd-studio-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'psd-studio'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-[#C9D4E5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#00D8FF]" />
                  <span>Image → PSD</span>
                </button>

                <button
                  onClick={() => setActiveView('future-tools')}
                  id="nav-future-tools-tab"
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    activeView === 'future-tools'
                      ? 'bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold shadow-lg shadow-[#00D8FF]/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-[#5FFFF7]" />
                  <span>Coming Soon</span>
                </button>

                <button
                  onClick={() => setIsAboutOpen(true)}
                  id="nav-about-tab"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Info className="w-3.5 h-3.5 text-[#5FFFF7]" />
                  <span>About</span>
                </button>
              </nav>

              {/* Action Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-[#00D8FF]/20 text-slate-300 hover:text-white hover:border-[#00D8FF] transition-all duration-200"
                  title="Toggle Light / Dark Mode"
                  id="theme-toggle-button"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-[#00D8FF]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#00D8FF]" />
                  )}
                </button>

                <button
                  onClick={() => setIsAboutOpen(true)}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-[#00D8FF]/20 text-slate-300 hover:text-white hover:border-[#00D8FF] transition-all duration-200"
                  title="Platform Settings & About"
                  id="settings-toggle-button"
                >
                  <Settings className="w-4 h-4 text-[#00D8FF]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 px-2 bg-[#0E1628]/95 border-t border-[#00D8FF]/15">
          <button
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'home' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveView('typo-studio')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'typo-studio' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Typo</span>
          </button>
          <button
            onClick={() => setActiveView('color-studio')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'color-studio' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Colors</span>
          </button>
          <button
            onClick={() => setActiveView('vector-studio')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'vector-studio' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Vector</span>
          </button>
          <button
            onClick={() => setActiveView('image-studio')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'image-studio' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Images</span>
          </button>
          <button
            onClick={() => setActiveView('script-studio')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'script-studio' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Script</span>
          </button>
          <button
            onClick={() => setActiveView('psd-studio')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'psd-studio' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>PSD</span>
          </button>
          <button
            onClick={() => setActiveView('future-tools')}
            className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium ${
              activeView === 'future-tools' ? 'text-[#00D8FF]' : 'text-slate-400'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Soon</span>
          </button>
        </div>
      </header>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onLaunchTool={(tool) => setActiveView(tool)}
      />
    </>
  );
};

