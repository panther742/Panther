import React, { useState, lazy, Suspense } from 'react';
import { ActiveView } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './components/Home';

// Lazy-loaded studio modules for maximum bundle optimization & page navigation speed (<150ms)
const TypoStudio = lazy(() =>
  import('./components/TypoStudio/TypoStudio').then((m) => ({ default: m.TypoStudio || m.default }))
);
const ColorStudio = lazy(() =>
  import('./components/ColorStudio/ColorStudio').then((m) => ({ default: m.ColorStudio || m.default }))
);
const VectorStudio = lazy(() =>
  import('./components/VectorStudio/VectorStudio').then((m) => ({ default: m.VectorStudio || m.default }))
);
const ImageStudio = lazy(() =>
  import('./components/ImageStudio/ImageStudio').then((m) => ({ default: m.ImageStudio || m.default }))
);
const ScriptStudio = lazy(() =>
  import('./components/ScriptStudio/ScriptStudio').then((m) => ({ default: m.ScriptStudio || m.default }))
);
const PSDStudio = lazy(() =>
  import('./components/PSDStudio/PSDStudio').then((m) => ({ default: m.PSDStudio || m.default }))
);
const FutureTools = lazy(() =>
  import('./components/FutureTools').then((m) => ({ default: m.FutureTools || m.default }))
);

const ViewSkeleton: React.FC = () => (
  <div className="py-12 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
    <div className="h-20 bg-[#0E1628]/80 rounded-3xl border border-[#00D8FF]/20" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-64 bg-[#0E1628]/60 rounded-3xl border border-[#00D8FF]/10" />
      <div className="h-64 bg-[#0E1628]/60 rounded-3xl border border-[#00D8FF]/10 md:col-span-2" />
    </div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#00D8FF] selection:text-black transition-colors duration-300 ${
        isDarkMode ? 'bg-[#060B16] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Suspense fallback={<ViewSkeleton />}>
          {activeView === 'home' && <Home setActiveView={setActiveView} />}
          {activeView === 'typo-studio' && <TypoStudio />}
          {activeView === 'color-studio' && <ColorStudio />}
          {activeView === 'vector-studio' && <VectorStudio />}
          {activeView === 'image-studio' && <ImageStudio />}
          {activeView === 'script-studio' && <ScriptStudio />}
          {activeView === 'psd-studio' && <PSDStudio />}
          {activeView === 'future-tools' && <FutureTools setActiveView={setActiveView} />}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer setActiveView={setActiveView} />
    </div>
  );
}

