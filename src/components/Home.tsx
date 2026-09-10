import React from 'react';
import { HeroCanvas } from './HeroCanvas';
import { ActiveView } from '../types';
import {
  Palette,
  Layers,
  Type,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  Download,
  Grid,
  Star,
  FileCode,
  Image,
  RefreshCw,
  ShieldCheck,
  Languages,
} from 'lucide-react';

interface HomeProps {
  setActiveView: (view: ActiveView) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveView }) => {
  const [parallaxOffset, setParallaxOffset] = React.useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    setParallaxOffset({
      x: Math.max(-4, Math.min(4, normX * 3.5)),
      y: Math.max(-4, Math.min(4, normY * 3.5)),
    });
  };

  const handleHeroMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative overflow-hidden bg-[#060B16] text-[#C9D4E5] min-h-screen">
      {/* HERO BANNER */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative min-h-[85vh] flex items-center justify-center pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#00D8FF]/15 select-none"
      >
        <HeroCanvas />

        <div
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8 transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E1628]/80 border border-[#00D8FF]/40 text-[#00D8FF] text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in glow-cyan">
            <Sparkles className="w-4 h-4 text-[#5FFFF7] animate-pulse" />
            <span>Panther Studio AI Design Platform</span>
            <span className="bg-[#00D8FF]/20 text-[#5FFFF7] px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border border-[#00D8FF]/40">
              PRO
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Professional AI Tools for{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] via-[#00D8FF] to-[#009DFF]">
                Designers & Print Pros
              </span>
            </h1>
            <p
              className="max-w-[850px] mx-auto text-[16px] sm:text-[19px] lg:text-[22px] font-medium leading-[1.7] tracking-[0.2px] text-center animate-fade-up"
              style={{ color: 'rgba(255, 255, 255, 0.82)' }}
            >
              Everything a designer needs—AI Typography Studio, AI Color Studio, Image to Vector, AI Image &amp; Video Generation, Font Translation, and many more powerful AI creative tools coming soon.
            </p>
          </div>

          {/* Single Premium CTA Button with Soft Blue Bloom */}
          <div className="flex items-center justify-center pt-4">
            <button
              onClick={() => setActiveView('typo-studio')}
              id="hero-explore-platform-cta"
              className="relative px-9 py-4 rounded-2xl bg-gradient-to-r from-[#00D8FF] via-[#28B8FF] to-[#007BFF] hover:from-[#7DF9FF] hover:to-[#00A6FF] text-black font-extrabold text-base shadow-[0_0_35px_rgba(0,216,255,0.35)] hover:shadow-[0_0_60px_rgba(0,216,255,0.65)] border border-[#00D8FF]/40 hover:border-[#5FFFF7] flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.02] group"
            >
              <span>Explore Panther Studio</span>
              <ArrowRight className="w-5 h-5 text-black transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Feature Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#C9D4E5]/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00D8FF]" />
              <span>Google Fonts & AI Typographic Pairing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00D8FF]" />
              <span>Real SVG, DXF, EPS, PDF Vector Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00D8FF]" />
              <span>Laser, CNC, Vinyl & Print Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED TOOLS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00D8FF]">
            Core Flagship Engines
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Featured Studio Tools</h2>
          <p className="text-[#C9D4E5]/80 text-sm max-w-xl mx-auto">
            Completely original AI design tools with electric futuristic polish, built for vinyl sign makers, CNC operators, branding agencies, and print shops.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tool Card 1: AI Typography Studio */}
          <div
            onClick={() => setActiveView('typo-studio')}
            className="group relative rounded-[18px] p-8 bg-[#111C30]/70 border border-[#00D8FF]/20 hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[#00D8FF]/20 flex flex-col justify-between"
            id="featured-tool-typo-studio-card"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                  <Type className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  Typography Engine
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00D8FF] transition-colors">
                Panther Typo Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Discover, combine, and preview font stacks dynamically with 1500+ Google Fonts and live mockups.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['1500+ Google Fonts', 'AI Pair Synthesizer', 'Multi-Mockup Canvas'].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#0E1628] border border-[#00D8FF]/20 text-[#C9D4E5] rounded-lg"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#00D8FF] group-hover:text-[#5FFFF7] gap-2 pt-4">
              <span>Open Typo Studio</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Tool Card 2: AI Color Studio */}
          <div
            onClick={() => setActiveView('color-studio')}
            className="group relative rounded-[18px] p-8 bg-[#111C30]/70 border border-[#00D8FF]/20 hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[#00D8FF]/20 flex flex-col justify-between"
            id="featured-tool-color-studio-card"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                  <Palette className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  Color Engine
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00D8FF] transition-colors">
                AI Color Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Create color palettes with interactive color wheel controls and WCAG contrast checks.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Color Wheel Dragging', 'Live Brand Previews', 'ASE/GPL Export'].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#0E1628] border border-[#00D8FF]/20 text-[#C9D4E5] rounded-lg"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#00D8FF] group-hover:text-[#5FFFF7] gap-2 pt-4">
              <span>Open Color Studio</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Tool Card 3: AI Image to Vector */}
          <div
            onClick={() => setActiveView('vector-studio')}
            className="group relative rounded-[18px] p-8 bg-[#111C30]/70 border border-[#00D8FF]/20 hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[#00D8FF]/20 flex flex-col justify-between"
            id="featured-tool-vector-studio-card"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                  <Layers className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  Vector Engine
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00D8FF] transition-colors">
                Image to Vector
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Vectorize raster graphics into smooth Bezier curves with DXF CAD, EPS, and PDF Vector output.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Background Removal', 'Node Reduction', 'DXF/EPS/PDF Downloads'].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#0E1628] border border-[#00D8FF]/20 text-[#C9D4E5] rounded-lg"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#00D8FF] group-hover:text-[#5FFFF7] gap-2 pt-4">
              <span>Open Vector Engine</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Tool Card 4: AI Image Generator */}
          <div
            onClick={() => setActiveView('image-studio')}
            className="group relative rounded-[18px] p-8 bg-[#111C30]/70 border border-[#00D8FF]/40 hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[#00D8FF]/30 flex flex-col justify-between"
            id="featured-tool-image-studio-card"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                  <Image className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  Diffusion Engine
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00D8FF] transition-colors">
                AI Image Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Unified AI Media Generator: generate high-res images, animated GIFs, and cinematic video clips.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Image / GIF / Video', 'DALL-E 3 / Imagen 3', 'Runway / Luma / Pika', '4K Upscale & Vector'].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#0E1628] border border-[#00D8FF]/20 text-[#C9D4E5] rounded-lg"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#00D8FF] group-hover:text-[#5FFFF7] gap-2 pt-4">
              <span>Open Image Studio</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Tool Card 5: AI Script Converter */}
          <div
            onClick={() => setActiveView('script-studio')}
            className="group relative rounded-[18px] p-8 bg-[#111C30]/70 border border-[#00D8FF]/40 hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[#00D8FF]/30 flex flex-col justify-between"
            id="featured-tool-script-studio-card"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                  <Languages className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 rounded-full">
                  NEW TOOL
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00D8FF] transition-colors">
                AI Script Converter
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Phonetic transliteration, smart brand preservation (e.g. Panther Studio → पैंथर स्टूडियो), designer variations, & live Google web fonts.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Smart Brand Protection', '150+ Languages', 'Designer Font Variations', 'Vector SVG Text Export'].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#0E1628] border border-[#00D8FF]/20 text-[#C9D4E5] rounded-lg"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#00D8FF] group-hover:text-[#5FFFF7] gap-2 pt-4">
              <span>Open Script Converter</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Tool Card 6: AI Image → Editable PSD */}
          <div
            onClick={() => setActiveView('psd-studio')}
            className="group relative rounded-[18px] p-8 bg-[#111C30]/70 border border-[#00D8FF]/40 hover:border-[#00D8FF] transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[#00D8FF]/30 flex flex-col justify-between"
            id="featured-tool-psd-studio-card"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 rounded-2xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF]">
                  <FileCode className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-[#00D8FF]/20 text-[#00D8FF] border border-[#00D8FF]/40 rounded-full">
                  FLAGSHIP
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00D8FF] transition-colors">
                Image → Editable PSD
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                AI Design Reconstruction: convert flyers, posters, banners, social posts, UI designs & logos into fully editable, multi-layered Photoshop (.PSD) files.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['OCR Text & Font Matching', 'Smart Object Extraction', 'Folder Hierarchy', 'PSD / PSB / ZIP Downloads'].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#0E1628] border border-[#00D8FF]/20 text-[#C9D4E5] rounded-lg"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#00D8FF] group-hover:text-[#5FFFF7] gap-2 pt-4">
              <span>Open Image → PSD</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR TOOLS & WORKFLOW HIGHLIGHTS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#00D8FF]/15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Popular Workflow Features */}
          <div className="p-6 rounded-[18px] bg-[#111C30]/70 border border-[#00D8FF]/20 space-y-4">
            <div className="flex items-center gap-2 text-[#00D8FF] font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>Popular Workflows</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Star className="w-3.5 h-3.5 text-[#00D8FF] shrink-0 mt-0.5" />
                <span>1500+ Google Fonts real-time injection & AI pairing suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-3.5 h-3.5 text-[#00D8FF] shrink-0 mt-0.5" />
                <span>Automatic noise removal & node smoothing for laser cutters</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-3.5 h-3.5 text-[#00D8FF] shrink-0 mt-0.5" />
                <span>ASE & GPL Swatch Exchange Export for Adobe Illustrator</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Recent Updates */}
          <div className="p-6 rounded-[18px] bg-[#111C30]/70 border border-[#00D8FF]/20 space-y-4">
            <div className="flex items-center gap-2 text-[#00D8FF] font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>Engine Features</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#5FFFF7] shrink-0 mt-0.5" />
                <span>AutoCAD (.dxf) & CorelDraw (.cdr.svg) vector outputs</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#5FFFF7] shrink-0 mt-0.5" />
                <span>Live typography mockups for websites, posters & brand packages</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#5FFFF7] shrink-0 mt-0.5" />
                <span>WCAG 2.1 AA/AAA contrast analyzer & swatch reordering</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Production Downloads */}
          <div className="p-6 rounded-[18px] bg-[#111C30]/70 border border-[#00D8FF]/20 space-y-4">
            <div className="flex items-center gap-2 text-[#00D8FF] font-bold text-sm">
              <Download className="w-4 h-4" />
              <span>Real File Exports</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every download button in Panther Studio generates real downloadable files directly in your browser.
            </p>
            <div className="flex flex-wrap gap-1">
              {['.SVG', '.DXF', '.EPS', '.PDF', '.ASE', '.GPL', '.CSS', '.MD'].map((ext) => (
                <span
                  key={ext}
                  className="px-2 py-0.5 text-[10px] font-bold bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF] rounded"
                >
                  {ext}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMING SOON SECTION (10 Future Tools Teaser) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#00D8FF]/15">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D8FF]">
              Upcoming Expansion
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Coming Soon Tools</h2>
          </div>
          <button
            onClick={() => setActiveView('future-tools')}
            className="px-5 py-2.5 rounded-xl bg-[#111C30] hover:bg-[#0E1628] border border-[#00D8FF]/30 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
            id="explore-all-future-tools-button"
          >
            <Grid className="w-4 h-4 text-[#00D8FF]" />
            <span>Explore Expansion Suite</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00D8FF]" />
          </button>
        </div>

        {/* Teaser Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: 'Background Remover', desc: 'AI Object isolation', badge: 'Coming Soon' },
            { title: 'SVG Cleaner', desc: 'Optimize & reduce node bloat', badge: 'Coming Soon' },
            { title: 'Gradient Generator', desc: 'Mesh & linear color stops', badge: 'Coming Soon' },
            { title: 'Pattern Generator', desc: 'Seamless vector tiles', badge: 'Coming Soon' },
            { title: 'Mockup Generator', desc: 'Photorealistic product frames', badge: 'Coming Soon' },
            { title: 'Brand Kit Generator', desc: 'Complete identity suite', badge: 'Coming Soon' },
            { title: 'Logo Maker AI', desc: 'Geometric mark synthesizer', badge: 'Coming Soon' },
            { title: 'Palette Extractor', desc: 'Extract colors from photos', badge: 'Coming Soon' },
          ].map((t) => (
            <div
              key={t.title}
              onClick={() => setActiveView('future-tools')}
              className="p-4 rounded-[18px] bg-[#111C30]/70 border border-[#00D8FF]/20 hover:border-[#00D8FF] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white group-hover:text-[#00D8FF] transition-colors">
                  {t.title}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/20 rounded">
                  {t.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


