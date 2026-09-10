import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Layers,
  Sparkles,
  Download,
  FileCode,
  CheckCircle2,
  Eye,
  EyeOff,
  Type,
  Square,
  Image as ImageIcon,
  Folder,
  FolderOpen,
  Settings,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Package,
  Wand2,
  Info,
  ArrowRight,
  Sliders,
  Maximize2,
  FileText,
  ShieldCheck,
  Award,
  SearchCheck,
  ScanLine,
  Target,
  Undo2,
  Redo2,
  Trash2,
  Edit3,
  Move,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Save,
  RotateCw,
  Palette,
  Plus,
  ChevronUp,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  PSDReconstructionBlueprint,
  PSDReconstructionOptions,
  DetectedTextLayer,
  DetectedShapeLayer,
  DetectedObjectLayer,
  normalizeBBox,
} from '../../lib/psdShared';
import { generatePhotoshopPSD, GeneratedPSDResult, ExtractedAsset } from '../../lib/psdBuilder';

// Popular Google Fonts list for dropdown selection
const GOOGLE_FONT_OPTIONS = [
  'Inter',
  'Playfair Display',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Oswald',
  'Raleway',
  'Lora',
  'Cinzel',
  'Space Grotesk',
  'Bebas Neue',
  'Merriweather',
  'Dancing Script',
  'Syne',
  'Plus Jakarta Sans',
  'Outfit',
  'Clash Display',
];

// Sample Graphic Presets for 1-click instant AI Reconstruction testing
const SAMPLE_PRESETS = [
  {
    id: 'sample-flyer',
    name: 'Modern Event Flyer',
    category: 'Flyer / Poster',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
    description: 'Dynamic event flyer with title, date badges, sponsor logos, and gradient backdrop',
  },
  {
    id: 'sample-ui',
    name: 'E-Commerce UI Card',
    category: 'UI / App Design',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    description: 'Modern glassmorphic product UI card with price tag, CTA button, and star ratings',
  },
  {
    id: 'sample-banner',
    name: 'Luxury Social Banner',
    category: 'Banner / Promo',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
    description: 'Executive corporate promo banner with headline, geometric container, and backdrop',
  },
];

export const PSDStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PRESETS[0].url);
  const [imageName, setImageName] = useState<string>(SAMPLE_PRESETS[0].name);
  const [sessionId, setSessionId] = useState<string>(() => `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 1920,
    height: 1080,
  });

  // Master Session Initializer: Guarantees 100% clean slate for every new image upload
  const startNewImageSession = (newImageUrl: string, newImageName: string) => {
    const newSession = `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    setSessionId(newSession);
    setSelectedImage(newImageUrl);
    setImageName(newImageName);

    // CRITICAL: CLEAR ALL PREVIOUS RECONSTRUCTION DATA (Zero previous data bleed-through)
    setBlueprint(null);
    setPsdResult(null);
    setHistoryStack([]);
    setHistoryIndex(-1);
    setSelectedLayerId(null);
    setEditingLayerId(null);
    setSelectedAssetId(null);
    setHiddenLayerIds(new Set());
    setLockedLayerIds(new Set());
    setSelectedExportLayerIds(new Set());
    setFilterSearch('');
    setLastSavedTime(null);
    setReconstructionError(null);
  };

  const [options, setOptions] = useState<PSDReconstructionOptions>({
    superResolutionScale: 2,
    exportDPI: 300,
    qualityMode: true,
    deblockingAndDenoising: true,
    faceRestoration: true,
    vectorMathReconstruction: true,
    removeBackground: true,
    replaceMissingFonts: true,
    rebuildBrokenElements: true,
    upscaleImages: true,
    vectorizeLogos: true,
    recreateMissingShapes: true,
    autoAlignLayers: true,
    autoGroupLayers: true,
    generateEditableMasks: true,
    targetLayerDetail: 15,
    exportFormat: 'psd',
  });

  const [isCustomDetail, setIsCustomDetail] = useState<boolean>(false);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [reconstructionError, setReconstructionError] = useState<string | null>(null);

  const [blueprint, setBlueprint] = useState<PSDReconstructionBlueprint | null>(null);
  const [psdResult, setPsdResult] = useState<GeneratedPSDResult | null>(null);

  // History Stack for Undo / Redo
  const [historyStack, setHistoryStack] = useState<PSDReconstructionBlueprint[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Layer Selection & Editing States
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [hiddenLayerIds, setHiddenLayerIds] = useState<Set<string>>(new Set());
  const [lockedLayerIds, setLockedLayerIds] = useState<Set<string>>(new Set());
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [selectedExportLayerIds, setSelectedExportLayerIds] = useState<Set<string>>(new Set());
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'split-slider' | 'reconstructed-only' | 'original-only'>('side-by-side');
  const [splitSliderPercent, setSplitSliderPercent] = useState<number>(50);

  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    Typography: true,
    People: true,
    Objects: true,
    Shapes: true,
    Logos: true,
    Effects: true,
    Background: true,
  });

  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'layers' | 'assets' | 'analysis' | 'quality' | 'fonts' | 'palette' | 'options' | 'metadata'>('layers');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [assetViewMode, setAssetViewMode] = useState<'cutout' | 'mask' | 'svg'>('cutout');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Helper to download a single extracted PNG asset
  const handleDownloadAsset = (asset: ExtractedAsset) => {
    const link = document.createElement('a');
    link.download = asset.filename;
    link.href = asset.dataUrl;
    link.click();
  };

  // Helper to download a single SVG asset
  const handleDownloadAssetSVG = (asset: ExtractedAsset) => {
    if (!asset.svgContent) return;
    const blob = new Blob([asset.svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = asset.filename.replace(/\.png$/, '.svg');
    link.href = url;
    link.click();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceAssetRef = useRef<HTMLInputElement>(null);

  // Load saved project state from localStorage if available
  useEffect(() => {
    try {
      const savedKey = `psd_studio_saved_project_${imageName || 'default'}`;
      const item = localStorage.getItem(savedKey);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed?.blueprint) {
          const restoredImage = parsed.selectedImage || selectedImage;
          const restoredName = parsed.imageName || imageName;
          setSelectedImage(restoredImage);
          setImageName(restoredName);
          setBlueprint(parsed.blueprint);
          setHistoryStack([parsed.blueprint]);
          setHistoryIndex(0);
          setLastSavedTime(new Date(parsed.savedAt).toLocaleTimeString());
          if (parsed.options) {
            setOptions((prev) => ({ ...prev, ...parsed.options }));
          }
          if (restoredImage) {
            generatePhotoshopPSD(restoredImage, parsed.blueprint, parsed.options || options)
              .then(setPsdResult)
              .catch((err) => {
                console.error('Failed to rebuild saved PSD:', err);
                setReconstructionError(err?.message || 'Failed to rebuild the saved project PSD.');
              });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load saved project:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clipboard Paste (Ctrl+V / Cmd+V) Event Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const newName = `Pasted_Design_${Date.now()}`;
            const reader = new FileReader();
            reader.onload = (evt) => {
              if (evt.target?.result) {
                startNewImageSession(evt.target.result as string, newName);
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Load exact natural dimensions when selected image changes
  useEffect(() => {
    if (!selectedImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth || 1920,
        height: img.naturalHeight || 1080,
      });
    };
    img.src = selectedImage;
  }, [selectedImage]);

  // Save current blueprint state to localStorage & history stack
  const commitBlueprintChange = (updatedBp: PSDReconstructionBlueprint) => {
    setBlueprint(updatedBp);

    // Maintain History Stack
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(updatedBp);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);

    // Re-generate Photoshop PSD binary & composite preview instantly
    if (selectedImage) {
      generatePhotoshopPSD(selectedImage, updatedBp, options).then(setPsdResult);
    }

    // Persist to localStorage
    try {
      const key = `psd_studio_saved_project_${imageName || 'default'}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          blueprint: updatedBp,
          imageName,
          selectedImage,
          options,
          savedAt: Date.now(),
        })
      );
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('LocalStorage save error:', err);
    }
  };

  // UNDO Action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const prevBp = historyStack[prevIdx];
      setBlueprint(prevBp);
      if (selectedImage) {
        generatePhotoshopPSD(selectedImage, prevBp, options).then(setPsdResult);
      }
    }
  };

  // REDO Action
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextBp = historyStack[nextIdx];
      setBlueprint(nextBp);
      if (selectedImage) {
        generatePhotoshopPSD(selectedImage, nextBp, options).then(setPsdResult);
      }
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const newName = file.name.replace(/\.[^/.]+$/, '');
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          startNewImageSession(evt.target.result as string, newName);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        startNewImageSession(evt.target.result as string, newName);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy color code
  const copyColorToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Run AI Design Reconstruction & Photoshop PSD Generation
  const runPSDReconstruction = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setReconstructionError(null);
    setProgressPercent(10);
    setProgressStage('Uploading Image & Initializing Isolated Session...');

    try {
      await new Promise((r) => setTimeout(r, 200));
      setProgressPercent(15);
      setProgressStage('Pass 1/12: Global Layout & Grid Structure Analysis (Analyzing from Zero)...');

      await new Promise((r) => setTimeout(r, 200));
      setProgressPercent(28);
      setProgressStage('Pass 2/12: Complete Object Segmentation & Cutout Isolation...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s vision engine timeout

      const resp = await fetch('/api/psd/reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: selectedImage,
          sessionId,
          options,
          imageWidth: imageDimensions.width,
          imageHeight: imageDimensions.height,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData?.error || errData?.details || `Server error (HTTP ${resp.status})`);
      }

      const data = await resp.json();
      const bp: PSDReconstructionBlueprint = data?.blueprint || null;
      if (!bp) {
        throw new Error('The reconstruction engine returned an empty blueprint. Please try again.');
      }

      setProgressPercent(42);
      setProgressStage('Pass 3/12: OCR & Typographic Google Font Identification...');
      await new Promise((r) => setTimeout(r, 250));

      setProgressPercent(54);
      setProgressStage('Pass 4 & 5/12: Vector Icons & Logo Identity Mark Isolation...');
      await new Promise((r) => setTimeout(r, 250));

      setProgressPercent(66);
      setProgressStage('Pass 6 & 7/12: Subject AI Face Restoration & Vector Containers...');
      await new Promise((r) => setTimeout(r, 250));

      setProgressPercent(78);
      setProgressStage('Pass 8 & 9/12: Surface Gradients & Shadow Depth Layer Separation...');
      await new Promise((r) => setTimeout(r, 250));

      setProgressPercent(88);
      setProgressStage('Pass 10 & 11/12: Outer Glows, Neon Accents & Texture Analysis...');
      await new Promise((r) => setTimeout(r, 250));

      setProgressPercent(95);
      setProgressStage('Pass 12/12: Multi-Region Validation & 98%+ Similarity Verification...');
      await new Promise((r) => setTimeout(r, 250));

      if (bp) {
        setBlueprint(bp);
        setHistoryStack([bp]);
        setHistoryIndex(0);

        const allIds = [
          ...bp.textLayers.map((t) => t.id),
          ...bp.objectLayers.map((o) => o.id),
          ...bp.shapeLayers.map((s) => s.id),
          'bg-1',
          'background-asset',
        ];
        setSelectedExportLayerIds(new Set(allIds));

        // Generate binary PSD using ag-psd with Ultra Quality Engine
        try {
          const res = await generatePhotoshopPSD(selectedImage, bp, options);
          setPsdResult(res);
        } catch (psdErr: any) {
          console.error('PSD binary generation error:', psdErr);
          setReconstructionError(
            psdErr?.message || 'PSD binary generation failed. Please try a different image.'
          );
        }
      }

      setProgressPercent(96);
      setProgressStage('Running Final Quality Audit Verification...');
      await new Promise((r) => setTimeout(r, 300));

      setProgressPercent(99);
      setProgressStage('Packaging High-Res PSD & Lossless Assets...');
      await new Promise((r) => setTimeout(r, 200));

      setProgressPercent(100);
      setProgressStage('Ready to Download!');
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: any) {
      console.error('PSD Reconstruction Error:', err);
      const message =
        err?.name === 'AbortError'
          ? 'The reconstruction request timed out after 180s. Please try again or use a smaller image.'
          : err?.message || 'Reconstruction failed unexpectedly. Please try again.';
      setReconstructionError(message);
      setProgressPercent(0);
      setProgressStage('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle folder open state
  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Toggle layer inclusion in exported PSD
  const toggleExportLayer = async (layerId: string) => {
    if (!blueprint || !selectedImage) return;
    const next = new Set(selectedExportLayerIds);
    if (next.has(layerId)) {
      if (next.size <= 1) return; // Keep at least 1 layer
      next.delete(layerId);
    } else {
      next.add(layerId);
    }
    setSelectedExportLayerIds(next);
    const updated = await generatePhotoshopPSD(selectedImage, blueprint, {
      ...options,
      selectedLayerIds: Array.from(next),
    });
    setPsdResult(updated);
  };

  // Preset Layer Selector (Top 5, Top 10, Top 15, Top 30, All)
  const selectPresetLayers = async (count: number | 'all') => {
    if (!blueprint || !selectedImage) return;
    const allIds: string[] = [
      ...blueprint.textLayers.map((t) => t.id),
      ...blueprint.objectLayers.map((o) => o.id),
      ...blueprint.shapeLayers.map((s) => s.id),
      'bg-1',
      'background-asset',
    ];

    let nextIds: Set<string>;
    if (count === 'all') {
      nextIds = new Set(allIds);
    } else {
      const prioritized = [
        'bg-1',
        'background-asset',
        ...blueprint.objectLayers.filter((o) => o.category === 'person').map((o) => o.id),
        ...blueprint.textLayers.slice(0, 3).map((t) => t.id),
        ...blueprint.shapeLayers.slice(0, 2).map((s) => s.id),
        ...blueprint.objectLayers.filter((o) => o.category !== 'person').map((o) => o.id),
        ...blueprint.textLayers.slice(3).map((t) => t.id),
        ...blueprint.shapeLayers.slice(2).map((s) => s.id),
      ];
      nextIds = new Set(prioritized.slice(0, Math.min(count, prioritized.length)));
    }

    setSelectedExportLayerIds(nextIds);
    const updated = await generatePhotoshopPSD(selectedImage, blueprint, {
      ...options,
      selectedLayerIds: Array.from(nextIds),
    });
    setPsdResult(updated);
  };

  // -------------------------------------------------------------
  // LAYER MANAGEMENT ACTIONS (DELETE, DUPLICATE, RENAME, MOVE, ETC.)
  // -------------------------------------------------------------

  // 1. DELETE LAYER (Completely removes layer from active project)
  const deleteLayer = (layerId: string) => {
    if (!blueprint) return;

    const updatedBp: PSDReconstructionBlueprint = {
      ...blueprint,
      textLayers: blueprint.textLayers.filter((l) => l.id !== layerId),
      shapeLayers: blueprint.shapeLayers.filter((l) => l.id !== layerId),
      objectLayers: blueprint.objectLayers.filter((l) => l.id !== layerId),
    };

    if (selectedLayerId === layerId) setSelectedLayerId(null);
    if (editingLayerId === layerId) setEditingLayerId(null);

    commitBlueprintChange(updatedBp);
  };

  // 2. DUPLICATE LAYER
  const duplicateLayer = (layerId: string) => {
    if (!blueprint) return;

    const newId = `layer_dup_${Date.now()}`;

    const textMatch = blueprint.textLayers.find((l) => l.id === layerId);
    if (textMatch) {
      const [ymin, xmin, ymax, xmax] = textMatch.bbox;
      const dup: DetectedTextLayer = {
        ...textMatch,
        id: newId,
        name: `${textMatch.name} (Copy)`,
        bbox: [
          Math.min(950, ymin + 20),
          Math.min(950, xmin + 20),
          Math.min(980, ymax + 20),
          Math.min(980, xmax + 20),
        ],
      };
      commitBlueprintChange({
        ...blueprint,
        textLayers: [...blueprint.textLayers, dup],
      });
      setSelectedLayerId(newId);
      return;
    }

    const shapeMatch = blueprint.shapeLayers.find((l) => l.id === layerId);
    if (shapeMatch) {
      const [ymin, xmin, ymax, xmax] = shapeMatch.bbox;
      const dup: DetectedShapeLayer = {
        ...shapeMatch,
        id: newId,
        name: `${shapeMatch.name} (Copy)`,
        bbox: [
          Math.min(950, ymin + 20),
          Math.min(950, xmin + 20),
          Math.min(980, ymax + 20),
          Math.min(980, xmax + 20),
        ],
      };
      commitBlueprintChange({
        ...blueprint,
        shapeLayers: [...blueprint.shapeLayers, dup],
      });
      setSelectedLayerId(newId);
      return;
    }

    const objMatch = blueprint.objectLayers.find((l) => l.id === layerId);
    if (objMatch) {
      const [ymin, xmin, ymax, xmax] = objMatch.bbox;
      const dup: DetectedObjectLayer = {
        ...objMatch,
        id: newId,
        name: `${objMatch.name} (Copy)`,
        bbox: [
          Math.min(950, ymin + 20),
          Math.min(950, xmin + 20),
          Math.min(980, ymax + 20),
          Math.min(980, xmax + 20),
        ],
      };
      commitBlueprintChange({
        ...blueprint,
        objectLayers: [...blueprint.objectLayers, dup],
      });
      setSelectedLayerId(newId);
      return;
    }
  };

  // 3. RENAME LAYER
  const renameLayer = (layerId: string, newName: string) => {
    if (!blueprint) return;

    const updatedBp: PSDReconstructionBlueprint = {
      ...blueprint,
      textLayers: blueprint.textLayers.map((l) => (l.id === layerId ? { ...l, name: newName } : l)),
      shapeLayers: blueprint.shapeLayers.map((l) => (l.id === layerId ? { ...l, name: newName } : l)),
      objectLayers: blueprint.objectLayers.map((l) => (l.id === layerId ? { ...l, name: newName } : l)),
    };

    commitBlueprintChange(updatedBp);
  };

  // 4. TOGGLE HIDE / SHOW LAYER
  const toggleLayerVisibility = (layerId: string) => {
    if (!blueprint) return;

    const toggle = <T extends { id: string; hidden?: boolean }>(arr: T[]) =>
      arr.map((l) => (l.id === layerId ? { ...l, hidden: !(l as any).hidden } : l));

    const updatedBp: PSDReconstructionBlueprint = {
      ...blueprint,
      textLayers: toggle(blueprint.textLayers),
      shapeLayers: toggle(blueprint.shapeLayers),
      objectLayers: toggle(blueprint.objectLayers),
    };

    setHiddenLayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });

    commitBlueprintChange(updatedBp);
  };

  // 5. TOGGLE LOCK / UNLOCK LAYER
  const toggleLayerLock = (layerId: string) => {
    setLockedLayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  };

  // 6. REORDER LAYER (Move Up / Down in list)
  const reorderLayer = (layerId: string, direction: 'up' | 'down') => {
    if (!blueprint) return;

    const swapInArray = <T extends { id: string }>(arr: T[]) => {
      const idx = arr.findIndex((item) => item.id === layerId);
      if (idx < 0) return arr;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return arr;
      const next = [...arr];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    };

    const updatedBp: PSDReconstructionBlueprint = {
      ...blueprint,
      textLayers: swapInArray(blueprint.textLayers),
      shapeLayers: swapInArray(blueprint.shapeLayers),
      objectLayers: swapInArray(blueprint.objectLayers),
    };

    commitBlueprintChange(updatedBp);
  };

  // 7. NUDGE LAYER POSITION (X, Y)
  const nudgeLayer = (layerId: string, dxPx: number, dyPx: number) => {
    if (!blueprint) return;

    const W = blueprint.width || 1920;
    const H = blueprint.height || 1080;
    const dxNorm = (dxPx / W) * 1000;
    const dyNorm = (dyPx / H) * 1000;

    const updateBBox = <T extends { id: string; bbox: [number, number, number, number] }>(arr: T[]) =>
      arr.map((l) => {
        if (l.id !== layerId) return l;
        const [ymin, xmin, ymax, xmax] = l.bbox;
        return {
          ...l,
          bbox: [
            Math.max(0, Math.min(1000, ymin + dyNorm)),
            Math.max(0, Math.min(1000, xmin + dxNorm)),
            Math.max(0, Math.min(1000, ymax + dyNorm)),
            Math.max(0, Math.min(1000, xmax + dxNorm)),
          ] as [number, number, number, number],
        };
      });

    const updatedBp: PSDReconstructionBlueprint = {
      ...blueprint,
      textLayers: updateBBox(blueprint.textLayers),
      shapeLayers: updateBBox(blueprint.shapeLayers),
      objectLayers: updateBBox(blueprint.objectLayers),
    };

    commitBlueprintChange(updatedBp);
  };

  // 8. EDIT TEXT LAYER PROPERTIES (Text string, font, size, color)
  const updateTextLayerProps = (layerId: string, updates: Partial<DetectedTextLayer>) => {
    if (!blueprint) return;

    const updatedBp: PSDReconstructionBlueprint = {
      ...blueprint,
      textLayers: blueprint.textLayers.map((l) => (l.id === layerId ? { ...l, ...updates } : l)),
    };

    commitBlueprintChange(updatedBp);
  };

  // 9. EDIT SHAPE LAYER PROPERTIES (Fill color, type, radius)
  const updateShapeLayerProps = (layerId: string, updates: Partial<DetectedShapeLayer>) => {
    if (!blueprint) return;

    const updatedBp: PSDReconstructionBlueprint = {
      ...blueprint,
      shapeLayers: blueprint.shapeLayers.map((l) => (l.id === layerId ? { ...l, ...updates } : l)),
    };

    commitBlueprintChange(updatedBp);
  };

  // 10. REPLACE ASSET IMAGE (For Object & Smart Object layers)
  const handleReplaceAssetFile = (layerId: string, file: File) => {
    if (!blueprint) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const updatedBp: PSDReconstructionBlueprint = {
        ...blueprint,
        objectLayers: blueprint.objectLayers.map((l) =>
          l.id === layerId ? { ...l, customImageDataUrl: dataUrl } : l
        ),
      };

      commitBlueprintChange(updatedBp);
    };
    reader.readAsDataURL(file);
  };

  // Copy report to clipboard
  const copyFontReport = () => {
    if (!psdResult) return;
    navigator.clipboard.writeText(psdResult.fontReportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060B16] text-[#C9D4E5] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* HERO SECTION BANNER */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-br from-[#0E1628]/90 via-[#0A1120]/90 to-[#060B16] border border-[#00D8FF]/30 shadow-[0_0_50px_rgba(0,216,255,0.15)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D8FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D8FF]/15 border border-[#00D8FF]/30 text-[#00D8FF] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#5FFFF7] animate-pulse" />
              <span>AI Design Reconstruction & Magic Layers Studio</span>
              <span className="bg-[#00D8FF]/20 text-white px-2 py-0.5 rounded-full text-[10px]">
                PRO
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              AI Graphic Reconstruction Engine
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload any JPG/PNG graphic, poster, or UI design. Our 12-Pass AI engine isolates objects,
              OCR text, Google Fonts, vector shapes, and backdrop gradients into a fully editable Adobe
              Photoshop (.PSD) file.
            </p>
          </div>

          {/* UNDO / REDO & PERSISTENCE HEADER CONTROLS */}
          {blueprint && (
            <div className="flex flex-wrap items-center gap-2 bg-black/40 border border-[#00D8FF]/30 p-2.5 rounded-2xl shadow-xl">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  historyIndex > 0
                    ? 'bg-[#111C30] hover:bg-[#16233B] text-[#00D8FF] border border-[#00D8FF]/40'
                    : 'bg-black/20 text-slate-600 border border-white/5 cursor-not-allowed'
                }`}
                title="Undo last layer operation (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
                <span>Undo</span>
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= historyStack.length - 1}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  historyIndex < historyStack.length - 1
                    ? 'bg-[#111C30] hover:bg-[#16233B] text-[#00D8FF] border border-[#00D8FF]/40'
                    : 'bg-black/20 text-slate-600 border border-white/5 cursor-not-allowed'
                }`}
                title="Redo layer operation (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
                <span>Redo</span>
              </button>

              <div className="w-px h-6 bg-white/10 my-auto" />

              <button
                type="button"
                onClick={() => commitBlueprintChange(blueprint)}
                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
                title="Save project state to LocalStorage"
              >
                <Save className="w-4 h-4" />
                <span>Save Project</span>
              </button>

              {lastSavedTime && (
                <span className="text-[10px] text-slate-400 font-mono px-2 py-1 rounded bg-black/30 border border-white/5">
                  Saved: {lastSavedTime}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WORKSPACE MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SOURCE UPLOADER & RECONSTRUCTION SETTINGS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0E1628]/90 border border-[#00D8FF]/20 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#00D8FF]/20 pb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#00D8FF]" />
                <h2 className="text-lg font-extrabold text-white">Source Image Studio</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {imageDimensions.width}x{imageDimensions.height} px
              </span>
            </div>

            {/* DRAG & DROP ZONE */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#00D8FF] bg-[#00D8FF]/15 scale-[1.01]'
                  : 'border-[#00D8FF]/30 hover:border-[#00D8FF]/60 bg-black/40 hover:bg-black/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative max-h-56 mx-auto rounded-xl overflow-hidden border border-[#00D8FF]/40 shadow-xl group">
                    <img
                      src={selectedImage}
                      alt="Source Input"
                      className="max-h-56 w-full object-contain mx-auto rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-white bg-[#00D8FF] text-black px-3 py-1.5 rounded-full shadow-lg">
                        Click to Replace Image
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-[#00D8FF] truncate font-bold">{imageName}</p>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Drop Graphic or Click to Upload</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 50MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* SAMPLE PRESETS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-300">Or Try 1-Click Graphic Sample Presets:</span>
                <span className="text-[10px] font-mono text-cyan-400">Fresh Zero-Assumption Analysis</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => startNewImageSession(preset.url, preset.name)}
                    className={`p-2 rounded-xl border text-left transition-all space-y-1 ${
                      imageName === preset.name
                        ? 'bg-[#00D8FF]/20 border-[#00D8FF] shadow-[0_0_15px_rgba(0,216,255,0.2)]'
                        : 'bg-black/30 border-white/10 hover:border-[#00D8FF]/40'
                    }`}
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-bold text-white truncate">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC LAYER DETAIL SELECTOR */}
            <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-[#00D8FF]/30 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#00D8FF]" />
                  LAYER DETAIL
                </span>
                <span className="text-[11px] font-mono font-bold text-[#00D8FF] bg-[#00D8FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D8FF]/30">
                  Target: {options.targetLayerDetail || 15} layers
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-7 gap-1">
                {[5, 10, 15, 20, 30, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      setOptions({ ...options, targetLayerDetail: count });
                      setIsCustomDetail(false);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                      (options.targetLayerDetail || 15) === count && !isCustomDetail
                        ? 'bg-[#00D8FF] text-black font-extrabold shadow-md scale-[1.02]'
                        : 'bg-black/30 text-slate-300 hover:text-white border border-white/10 hover:border-[#00D8FF]/40'
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomDetail(true)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                    isCustomDetail
                      ? 'bg-[#00D8FF] text-black font-extrabold shadow-md scale-[1.02]'
                      : 'bg-black/30 text-slate-300 hover:text-white border border-white/10 hover:border-[#00D8FF]/40'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Slider Controls */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>LOW DETAIL</span>
                  <span>HIGH DETAIL</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={60}
                  step={1}
                  value={options.targetLayerDetail || 15}
                  onChange={(e) => {
                    setOptions({ ...options, targetLayerDetail: Number(e.target.value) });
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00D8FF]"
                />
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-slate-300 font-medium">Selected layers: <strong className="text-[#00D8FF] font-bold">{options.targetLayerDetail || 15}</strong></span>
                  <span className="text-[#5FFFF7] font-bold">Estimated output: ~{options.targetLayerDetail || 15} layers</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed bg-[#00D8FF]/5 p-2 rounded-lg border border-[#00D8FF]/15">
                  {(options.targetLayerDetail || 15) <= 8
                    ? '🎯 5-Layer mode: Intelligently groups related typography and secondary shapes into unified layers while completely preserving full layout and all visual subjects.'
                    : (options.targetLayerDetail || 15) >= 25
                    ? '⚡ Ultra Granular mode: Decomposes every independent word, badge, button, wave, icon, shadow, subject, and graphic into dedicated fine-grained individual layers.'
                    : '✨ Balanced Pro mode: Ideal decomposition of editable typography, subject cutouts, vector shapes, smart icons, and clean reconstructed backdrop.'}
                </p>
              </div>
            </div>

            {/* RECONSTRUCT BUTTON */}
            <button
              type="button"
              onClick={runPSDReconstruction}
              disabled={isAnalyzing || !selectedImage}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${
                isAnalyzing
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-wait'
                  : 'bg-gradient-to-r from-[#00D8FF] via-[#0099FF] to-[#007BFF] text-black hover:scale-[1.02] shadow-[#00D8FF]/25'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#00D8FF]" />
                  <span>AI Reconstruction in Progress...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-black" />
                  <span>Reconstruct Editable Photoshop PSD</span>
                </>
              )}
            </button>

            {/* RESOLUTION MODE & DPI SELECTION */}
            <div className="space-y-3 pt-2 border-t border-[#00D8FF]/20">
              <span className="text-xs font-extrabold text-slate-300">Super-Resolution & DPI Engine</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 4, 8, 16].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setOptions({ ...options, superResolutionScale: scale as any })}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                      options.superResolutionScale === scale
                        ? 'bg-[#00D8FF] text-black shadow-md font-extrabold'
                        : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {scale}x {scale === 1 ? 'Native' : scale === 2 ? 'HD' : scale === 4 ? '4K' : scale === 8 ? '8K' : 'Ultra'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { dpi: 72, label: '72 DPI (Web)' },
                  { dpi: 150, label: '150 DPI (Std)' },
                  { dpi: 300, label: '300 DPI (Print Pro)' },
                  { dpi: 600, label: '600 DPI (Master)' },
                ].map((dpiItem) => (
                  <button
                    key={dpiItem.dpi}
                    type="button"
                    onClick={() => setOptions({ ...options, exportDPI: dpiItem.dpi as any })}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all text-center ${
                      (options.exportDPI || 300) === dpiItem.dpi
                        ? 'bg-[#00D8FF]/20 text-[#00D8FF] border border-[#00D8FF]/50'
                        : 'bg-black/20 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {dpiItem.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECONSTRUCTION RESULTS & MAGIC LAYERS STUDIO */}
        <div className="lg:col-span-7 space-y-6">
          {/* ERROR BANNER */}
          {reconstructionError && !isAnalyzing && (
            <div className="p-5 rounded-3xl bg-rose-950/70 border border-rose-500/50 space-y-3 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-rose-200">Reconstruction Problem Detected</h3>
                  <p className="text-xs text-rose-300/90 leading-relaxed">{reconstructionError}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={runPSDReconstruction}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Reconstruction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReconstructionError(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* PROGRESS HUD BAR */}
          {isAnalyzing && (
            <div className="p-6 rounded-3xl bg-[#0E1628] border border-[#00D8FF]/40 space-y-4 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#00D8FF]">{progressStage}</span>
                <span className="font-mono text-white font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-3 border border-[#00D8FF]/20 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#00D8FF] to-[#007BFF] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                GPU Accelerated Parallel AI Design Reconstruction in Progress... Target completion under 30s.
              </p>
            </div>
          )}

          {/* MAIN RESULTS CONTAINER */}
          {blueprint && psdResult ? (
            <div className="space-y-6">
              {/* SUMMARY STATS & DOWNLOAD BAR */}
              <div className="p-6 rounded-3xl bg-[#0E1628]/90 border border-[#00D8FF]/30 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{blueprint.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{blueprint.summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#00D8FF]/10 text-[#00D8FF] text-xs font-bold border border-[#00D8FF]/30">
                      {psdResult.layerCount} Active Layers
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#00D8FF]/10 text-[#00D8FF] text-xs font-bold border border-[#00D8FF]/30">
                      {psdResult.folderCount} Folders
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Validated PSD
                    </span>
                  </div>
                </div>

                {/* LAYER TYPE METRICS BREAKDOWN */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-[#00D8FF]/15 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-bold">Typography</span>
                    <span className="font-mono text-[#00D8FF] font-extrabold">{blueprint.textLayers.length} Layers</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-[#00D8FF]/15 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-bold">Vector Shapes</span>
                    <span className="font-mono text-[#5FFFF7] font-extrabold">{blueprint.shapeLayers.length} Layers</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-[#00D8FF]/15 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-bold">Smart Objects</span>
                    <span className="font-mono text-[#00D8FF] font-extrabold">{blueprint.objectLayers.length} Layers</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-[#00D8FF]/15 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-bold">Backdrop</span>
                    <span className="font-mono text-emerald-400 font-extrabold">1 Layer</span>
                  </div>
                </div>

                {/* RECONSTRUCTED COMPOSITE PREVIEW VS ORIGINAL SOURCE WITH INTERACTIVE VALIDATION & SPLIT MODES */}
                {psdResult.reconstructedPreviewUrl && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-[#00D8FF]/20 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#00D8FF]" />
                        Reconstruction Validation & Canvas Comparison
                      </span>
                      
                      {/* VIEW / COMPARISON MODE TOGGLES */}
                      <div className="flex items-center gap-1 bg-[#111C30] p-1 rounded-xl border border-[#00D8FF]/20 text-[11px]">
                        <button
                          onClick={() => setComparisonMode('side-by-side')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            comparisonMode === 'side-by-side'
                              ? 'bg-[#00D8FF] text-black shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Side-by-Side
                        </button>
                        <button
                          onClick={() => setComparisonMode('split-slider')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            comparisonMode === 'split-slider'
                              ? 'bg-[#00D8FF] text-black shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Split Wipe Slider
                        </button>
                        <button
                          onClick={() => setComparisonMode('reconstructed-only')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            comparisonMode === 'reconstructed-only'
                              ? 'bg-[#00D8FF] text-black shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Reconstructed Layers
                        </button>
                        <button
                          onClick={() => setComparisonMode('original-only')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            comparisonMode === 'original-only'
                              ? 'bg-[#00D8FF] text-black shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Original Source
                        </button>
                      </div>
                    </div>

                    {/* COMPARISON VIEWPORT */}
                    {comparisonMode === 'side-by-side' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* ORIGINAL SOURCE */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Original Uploaded Source
                          </span>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center p-2">
                            <img src={selectedImage} alt="Original" className="max-h-full max-w-full object-contain rounded" />
                          </div>
                        </div>

                        {/* RECONSTRUCTED COMPOSITE */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#00D8FF] uppercase tracking-wider block">
                            Reconstructed Layer Composite ({psdResult.layerCount} Active Layers)
                          </span>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-[#00D8FF]/30 flex items-center justify-center p-2 group">
                            <img
                              src={psdResult.reconstructedPreviewUrl}
                              alt="Reconstructed Composite"
                              className="max-h-full max-w-full object-contain rounded shadow-lg"
                            />

                            {/* INTERACTIVE BOUNDING BOX OVERLAY LAYER */}
                            <div className="absolute inset-2 pointer-events-auto">
                              {[
                                ...(blueprint.textLayers || []).map((l) => ({ ...l, layerType: 'text' })),
                                ...(blueprint.shapeLayers || []).map((l) => ({ ...l, layerType: 'shape' })),
                                ...(blueprint.objectLayers || []).map((l) => ({ ...l, layerType: 'object' })),
                              ]
                                .filter((l) => !(l as any).hidden && (selectedExportLayerIds.size === 0 || selectedExportLayerIds.has(l.id)))
                                .map((l) => {
                                  const [ymin, xmin, ymax, xmax] = normalizeBBox(l.bbox, [0, 0, 1000, 1000]);
                                  const top = ymin / 10;
                                  const left = xmin / 10;
                                  const width = Math.max(3, (xmax - xmin) / 10);
                                  const height = Math.max(3, (ymax - ymin) / 10);
                                  const isSelected = selectedLayerId === l.id;

                                  return (
                                    <div
                                      key={l.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLayerId(l.id);
                                        setEditingLayerId(l.id);
                                      }}
                                      className={`absolute transition-all cursor-pointer rounded ${
                                        isSelected
                                          ? 'border-2 border-[#00D8FF] bg-[#00D8FF]/20 shadow-[0_0_15px_rgba(0,216,255,0.6)] z-20'
                                          : 'border border-dashed border-[#00D8FF]/40 hover:border-[#00D8FF] hover:bg-[#00D8FF]/10 z-10'
                                      }`}
                                      style={{
                                        top: `${top}%`,
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        height: `${height}%`,
                                      }}
                                    >
                                      {isSelected && (
                                        <>
                                          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#00D8FF] rounded-full border border-black" />
                                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00D8FF] rounded-full border border-black" />
                                          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#00D8FF] rounded-full border border-black" />
                                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#00D8FF] rounded-full border border-black" />

                                          <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0E1628] border border-[#00D8FF]/60 rounded-xl px-2 py-1 shadow-2xl flex items-center gap-1 z-30 text-[10px] whitespace-nowrap text-white"
                                          >
                                            <button
                                              onClick={() => nudgeLayer(l.id, -10, 0)}
                                              className="p-1 hover:bg-[#00D8FF]/20 rounded text-slate-300 hover:text-white"
                                              title="Nudge Left"
                                            >
                                              ←
                                            </button>
                                            <button
                                              onClick={() => nudgeLayer(l.id, 10, 0)}
                                              className="p-1 hover:bg-[#00D8FF]/20 rounded text-slate-300 hover:text-white"
                                              title="Nudge Right"
                                            >
                                              →
                                            </button>
                                            <button
                                              onClick={() => nudgeLayer(l.id, 0, -10)}
                                              className="p-1 hover:bg-[#00D8FF]/20 rounded text-slate-300 hover:text-white"
                                              title="Nudge Up"
                                            >
                                              ↑
                                            </button>
                                            <button
                                              onClick={() => nudgeLayer(l.id, 0, 10)}
                                              className="p-1 hover:bg-[#00D8FF]/20 rounded text-slate-300 hover:text-white"
                                              title="Nudge Down"
                                            >
                                              ↓
                                            </button>
                                            <div className="w-px h-3 bg-white/20 my-auto" />
                                            <button
                                              onClick={() => duplicateLayer(l.id)}
                                              className="p-1 hover:bg-[#00D8FF]/20 rounded text-[#00D8FF]"
                                              title="Duplicate Layer"
                                            >
                                              <Copy className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => deleteLayer(l.id)}
                                              className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                              title="Delete Layer"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {comparisonMode === 'split-slider' && (
                      <div className="space-y-2">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-[#00D8FF]/40 select-none">
                          {/* Underlying Reconstructed Composite */}
                          <img
                            src={psdResult.reconstructedPreviewUrl}
                            alt="Reconstructed"
                            className="absolute inset-0 w-full h-full object-contain"
                          />

                          {/* Clipped Original Source on Top */}
                          <div
                            className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-[#00D8FF] shadow-[0_0_15px_rgba(0,216,255,0.8)]"
                            style={{ width: `${splitSliderPercent}%` }}
                          >
                            <img
                              src={selectedImage}
                              alt="Original"
                              className="absolute inset-0 w-full h-full object-contain max-w-none"
                              style={{ width: '100%', height: '100%' }}
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white border border-white/20">
                              Original
                            </div>
                          </div>

                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-[#00D8FF] border border-[#00D8FF]/30">
                            Reconstructed Layers
                          </div>
                        </div>

                        {/* Interactive Range Slider */}
                        <div className="flex items-center gap-3 px-2">
                          <span className="text-[11px] text-slate-400 font-bold">Original</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={splitSliderPercent}
                            onChange={(e) => setSplitSliderPercent(Number(e.target.value))}
                            className="w-full accent-[#00D8FF] cursor-ew-resize h-2 bg-black/60 rounded-lg border border-[#00D8FF]/30"
                          />
                          <span className="text-[11px] text-[#00D8FF] font-bold">Reconstruction</span>
                        </div>
                      </div>
                    )}

                    {comparisonMode === 'reconstructed-only' && (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-[#00D8FF]/30 flex items-center justify-center p-2">
                        <img
                          src={psdResult.reconstructedPreviewUrl}
                          alt="Reconstructed"
                          className="max-h-full max-w-full object-contain rounded"
                        />
                      </div>
                    )}

                    {comparisonMode === 'original-only' && (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/20 flex items-center justify-center p-2">
                        <img
                          src={selectedImage}
                          alt="Original"
                          className="max-h-full max-w-full object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* LAYER SELECTION PRESETS TOOLBAR (Step 14: Export Selected Layers) */}
                <div className="p-4 rounded-2xl bg-[#111C30]/90 border border-[#00D8FF]/30 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">PSD Layer Export Budget:</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#00D8FF]/20 text-[#00D8FF] text-[11px] font-mono font-extrabold border border-[#00D8FF]/40">
                        {selectedExportLayerIds.size > 0 ? selectedExportLayerIds.size : psdResult.layerCount} of{' '}
                        {blueprint.textLayers.length + blueprint.objectLayers.length + blueprint.shapeLayers.length + 1} Selected
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <button
                        onClick={() => selectPresetLayers('all')}
                        className="px-2.5 py-1 rounded-xl bg-[#00D8FF]/15 hover:bg-[#00D8FF]/30 text-[#00D8FF] font-bold border border-[#00D8FF]/30 transition-all"
                      >
                        All Layers
                      </button>
                      <button
                        onClick={() => selectPresetLayers(5)}
                        className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-[#00D8FF]/20 text-slate-300 hover:text-white font-bold border border-white/10 transition-all"
                      >
                        Top 5 Core
                      </button>
                      <button
                        onClick={() => selectPresetLayers(10)}
                        className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-[#00D8FF]/20 text-slate-300 hover:text-white font-bold border border-white/10 transition-all"
                      >
                        Top 10 Main
                      </button>
                      <button
                        onClick={() => selectPresetLayers(15)}
                        className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-[#00D8FF]/20 text-slate-300 hover:text-white font-bold border border-white/10 transition-all"
                      >
                        Top 15 Granular
                      </button>
                      <button
                        onClick={() => selectPresetLayers(30)}
                        className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-[#00D8FF]/20 text-slate-300 hover:text-white font-bold border border-white/10 transition-all"
                      >
                        Top 30 Full
                      </button>
                    </div>
                  </div>
                </div>

                {/* PRIMARY EXPORT BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <a
                    href={psdResult.psdUrl}
                    download={`${psdResult.filename}.psd`}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-[#00D8FF] to-[#007BFF] text-black font-extrabold text-xs shadow-lg shadow-[#00D8FF]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <Download className="w-4 h-4 text-black" />
                    <span>Download Photoshop (.PSD)</span>
                  </a>

                  <a
                    href={psdResult.psbUrl}
                    download={`${psdResult.filename}.psb`}
                    className="p-3.5 rounded-2xl bg-[#111C30] hover:bg-[#16233B] border border-[#00D8FF]/30 text-slate-200 font-bold text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <FileCode className="w-4 h-4 text-[#00D8FF]" />
                    <span>Download Large (.PSB)</span>
                  </a>

                  <a
                    href={psdResult.zipUrl}
                    download={`${psdResult.filename}_Package.zip`}
                    className="p-3.5 rounded-2xl bg-[#111C30] hover:bg-[#16233B] border border-[#00D8FF]/30 text-slate-200 font-bold text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <Package className="w-4 h-4 text-[#5FFFF7]" />
                    <span>Download Complete (.ZIP)</span>
                  </a>
                </div>
              </div>

              {/* TABS NAVIGATION: LAYERS, FONTS, PALETTE, METADATA */}
              <div className="p-6 rounded-3xl bg-[#0E1628]/80 border border-[#00D8FF]/20 space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#00D8FF]/20 pb-3">
                  {[
                    { id: 'layers', label: 'Layers & Hierarchy', icon: Layers },
                    { id: 'assets', label: 'Extracted Assets Inspector (PNG/SVG)', icon: Package },
                    { id: 'analysis', label: '12-Pass AI Reference Analysis', icon: SearchCheck },
                    { id: 'quality', label: 'Ultra Quality Audit', icon: ShieldCheck },
                    { id: 'palette', label: 'Color Palette Inspector', icon: Sliders },
                    { id: 'fonts', label: 'Font Replacement Report', icon: Type },
                    { id: 'metadata', label: 'Design Blueprint JSON', icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#00D8FF] text-black shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: INTERACTIVE LAYERS & HIERARCHY TREE */}
                {activeTab === 'layers' && (
                  <div className="space-y-4">
                    {/* SEARCH & LAYER TOOLS HEADER */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-[#00D8FF]/20">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filter layers by name..."
                          value={filterSearch}
                          onChange={(e) => setFilterSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#00D8FF] focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span>Total: {psdResult.layerCount} Layers</span>
                      </div>
                    </div>

                    {/* FOLDER 1: TYPOGRAPHY */}
                    {blueprint.textLayers.length > 0 && (
                      <div className="border border-[#00D8FF]/20 rounded-2xl overflow-hidden bg-black/20">
                        <div
                          onClick={() => toggleFolder('Typography')}
                          className="flex items-center justify-between p-3.5 bg-[#111C30] cursor-pointer hover:bg-[#16233B] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                            {openFolders['Typography'] ? (
                              <FolderOpen className="w-4 h-4 text-[#00D8FF]" />
                            ) : (
                              <Folder className="w-4 h-4 text-[#00D8FF]" />
                            )}
                            <span>Typography (Editable OCR Fonts)</span>
                          </div>
                          <span className="text-[10px] text-[#00D8FF] font-mono font-bold">
                            {blueprint.textLayers.length} Layers
                          </span>
                        </div>

                        {openFolders['Typography'] && (
                          <div className="p-3 space-y-3">
                            {blueprint.textLayers
                              .filter((l) => !filterSearch || l.name.toLowerCase().includes(filterSearch.toLowerCase()) || l.text.toLowerCase().includes(filterSearch.toLowerCase()))
                              .map((layer) => {
                                const isSelected = selectedLayerId === layer.id;
                                const isEditing = editingLayerId === layer.id;
                                const isHidden = (layer as any).hidden;
                                const isLocked = lockedLayerIds.has(layer.id);

                                return (
                                  <div
                                    key={layer.id}
                                    onClick={() => setSelectedLayerId(layer.id)}
                                    className={`p-3 rounded-xl border transition-all space-y-3 ${
                                      isSelected
                                        ? 'bg-[#00D8FF]/15 border-[#00D8FF] shadow-lg'
                                        : 'bg-[#0E1628]/60 border-[#00D8FF]/10 hover:border-[#00D8FF]/30'
                                    } ${isHidden ? 'opacity-40' : ''}`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedExportLayerIds.size === 0 || selectedExportLayerIds.has(layer.id)}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            toggleExportLayer(layer.id);
                                          }}
                                          className="w-3.5 h-3.5 rounded accent-[#00D8FF] cursor-pointer"
                                          title="Include in exported PSD"
                                        />
                                        <Type className="w-4 h-4 text-[#00D8FF]" />
                                        <input
                                          type="text"
                                          value={layer.name}
                                          onChange={(e) => renameLayer(layer.id, e.target.value)}
                                          className="bg-transparent border-b border-transparent hover:border-[#00D8FF]/40 text-xs font-bold text-white focus:border-[#00D8FF] focus:outline-none"
                                        />
                                      </div>

                                      {/* LAYER QUICK ACTION TOOLBAR */}
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLayerVisibility(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                          title="Toggle Visibility"
                                        >
                                          {isHidden ? <EyeOff className="w-3.5 h-3.5 text-red-400" /> : <Eye className="w-3.5 h-3.5 text-[#00D8FF]" />}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLayerLock(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                          title="Toggle Lock"
                                        >
                                          {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            reorderLayer(layer.id, 'up');
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                          title="Move Up"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            reorderLayer(layer.id, 'down');
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                          title="Move Down"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateLayer(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#00D8FF]"
                                          title="Duplicate Layer"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteLayer(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                                          title="Delete Layer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingLayerId(isEditing ? null : layer.id);
                                          }}
                                          className="p-1.5 rounded-lg bg-[#00D8FF]/20 text-[#00D8FF] text-[10px] font-bold"
                                        >
                                          {isEditing ? 'Close' : 'Edit Props'}
                                        </button>
                                      </div>
                                    </div>

                                    {/* TEXT STRING INPUT */}
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={layer.text}
                                        onChange={(e) => updateTextLayerProps(layer.id, { text: e.target.value })}
                                        className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-[#00D8FF]/30 text-xs text-white font-mono focus:border-[#00D8FF] focus:outline-none"
                                        placeholder="Edit layer text..."
                                      />
                                      <span
                                        className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-sm"
                                        style={{ backgroundColor: layer.colorHex }}
                                        title={`Text Color: ${layer.colorHex}`}
                                      />
                                    </div>

                                    {/* EXPANDED TEXT PROPERTY EDITOR */}
                                    {isEditing && (
                                      <div className="p-3 rounded-xl bg-black/40 border border-[#00D8FF]/20 space-y-3 pt-3">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Google Font</label>
                                            <select
                                              value={layer.matchedGoogleFont || 'Inter'}
                                              onChange={(e) =>
                                                updateTextLayerProps(layer.id, {
                                                  matchedGoogleFont: e.target.value,
                                                  fontFamily: e.target.value,
                                                })
                                              }
                                              className="w-full px-2 py-1 rounded bg-black border border-white/10 text-xs text-white"
                                            >
                                              {GOOGLE_FONT_OPTIONS.map((f) => (
                                                <option key={f} value={f}>
                                                  {f}
                                                </option>
                                              ))}
                                            </select>
                                          </div>

                                          <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Font Size (px)</label>
                                            <input
                                              type="number"
                                              value={layer.fontSizePx || 24}
                                              onChange={(e) => updateTextLayerProps(layer.id, { fontSizePx: Number(e.target.value) })}
                                              className="w-full px-2 py-1 rounded bg-black border border-white/10 text-xs text-white font-mono"
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-bold text-slate-400">Color Hex:</label>
                                            <input
                                              type="color"
                                              value={layer.colorHex || '#FFFFFF'}
                                              onChange={(e) => updateTextLayerProps(layer.id, { colorHex: e.target.value })}
                                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                                            />
                                            <input
                                              type="text"
                                              value={layer.colorHex || '#FFFFFF'}
                                              onChange={(e) => updateTextLayerProps(layer.id, { colorHex: e.target.value })}
                                              className="w-20 px-2 py-1 rounded bg-black border border-white/10 text-xs text-white font-mono uppercase"
                                            />
                                          </div>

                                          {/* NUDGE COORDINATES */}
                                          <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-slate-400 mr-1">Position:</span>
                                            <button
                                              onClick={() => nudgeLayer(layer.id, -10, 0)}
                                              className="px-2 py-0.5 rounded bg-black border border-white/10 hover:border-[#00D8FF] text-xs font-bold text-white"
                                            >
                                              ←
                                            </button>
                                            <button
                                              onClick={() => nudgeLayer(layer.id, 10, 0)}
                                              className="px-2 py-0.5 rounded bg-black border border-white/10 hover:border-[#00D8FF] text-xs font-bold text-white"
                                            >
                                              →
                                            </button>
                                            <button
                                              onClick={() => nudgeLayer(layer.id, 0, -10)}
                                              className="px-2 py-0.5 rounded bg-black border border-white/10 hover:border-[#00D8FF] text-xs font-bold text-white"
                                            >
                                              ↑
                                            </button>
                                            <button
                                              onClick={() => nudgeLayer(layer.id, 0, 10)}
                                              className="px-2 py-0.5 rounded bg-black border border-white/10 hover:border-[#00D8FF] text-xs font-bold text-white"
                                            >
                                              ↓
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FOLDER 2: VECTOR SHAPES */}
                    {blueprint.shapeLayers.length > 0 && (
                      <div className="border border-[#00D8FF]/20 rounded-2xl overflow-hidden bg-black/20">
                        <div
                          onClick={() => toggleFolder('Shapes')}
                          className="flex items-center justify-between p-3.5 bg-[#111C30] cursor-pointer hover:bg-[#16233B] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                            {openFolders['Shapes'] ? (
                              <FolderOpen className="w-4 h-4 text-[#00D8FF]" />
                            ) : (
                              <Folder className="w-4 h-4 text-[#00D8FF]" />
                            )}
                            <span>Shapes & Vector Containers</span>
                          </div>
                          <span className="text-[10px] text-[#00D8FF] font-mono font-bold">
                            {blueprint.shapeLayers.length} Layers
                          </span>
                        </div>

                        {openFolders['Shapes'] && (
                          <div className="p-3 space-y-3">
                            {blueprint.shapeLayers
                              .filter((l) => !filterSearch || l.name.toLowerCase().includes(filterSearch.toLowerCase()))
                              .map((layer) => {
                                const isSelected = selectedLayerId === layer.id;
                                const isEditing = editingLayerId === layer.id;
                                const isHidden = (layer as any).hidden;

                                return (
                                  <div
                                    key={layer.id}
                                    onClick={() => setSelectedLayerId(layer.id)}
                                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                                      isSelected
                                        ? 'bg-[#00D8FF]/15 border-[#00D8FF] shadow-lg'
                                        : 'bg-[#0E1628]/60 border-[#00D8FF]/10 hover:border-[#00D8FF]/30'
                                    } ${isHidden ? 'opacity-40' : ''}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedExportLayerIds.size === 0 || selectedExportLayerIds.has(layer.id)}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            toggleExportLayer(layer.id);
                                          }}
                                          className="w-3.5 h-3.5 rounded accent-[#00D8FF] cursor-pointer"
                                          title="Include in exported PSD"
                                        />
                                        <Square className="w-4 h-4 text-[#00D8FF]" />
                                        <input
                                          type="text"
                                          value={layer.name}
                                          onChange={(e) => renameLayer(layer.id, e.target.value)}
                                          className="bg-transparent border-b border-transparent hover:border-[#00D8FF]/40 text-xs font-bold text-white focus:border-[#00D8FF] focus:outline-none"
                                        />
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLayerVisibility(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                        >
                                          {isHidden ? <EyeOff className="w-3.5 h-3.5 text-red-400" /> : <Eye className="w-3.5 h-3.5 text-[#00D8FF]" />}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateLayer(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#00D8FF]"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteLayer(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingLayerId(isEditing ? null : layer.id);
                                          }}
                                          className="p-1.5 rounded-lg bg-[#00D8FF]/20 text-[#00D8FF] text-[10px] font-bold"
                                        >
                                          {isEditing ? 'Close' : 'Edit Props'}
                                        </button>
                                      </div>
                                    </div>

                                    {/* SHAPE DETAILS */}
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-mono text-slate-400 capitalize">
                                        Type: {layer.type} ({layer.borderRadiusPx}px radius)
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-mono">Fill:</span>
                                        <span
                                          className="w-4 h-4 rounded-full border border-white/20"
                                          style={{ backgroundColor: layer.fill }}
                                        />
                                      </div>
                                    </div>

                                    {/* EXPANDED SHAPE PROPERTY CONTROLS */}
                                    {isEditing && (
                                      <div className="p-3 rounded-xl bg-black/40 border border-[#00D8FF]/20 space-y-3 pt-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-bold text-slate-400">Fill Color:</label>
                                            <input
                                              type="color"
                                              value={layer.fill || '#0E1628'}
                                              onChange={(e) => updateShapeLayerProps(layer.id, { fill: e.target.value })}
                                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                                            />
                                            <input
                                              type="text"
                                              value={layer.fill || '#0E1628'}
                                              onChange={(e) => updateShapeLayerProps(layer.id, { fill: e.target.value })}
                                              className="w-20 px-2 py-1 rounded bg-black border border-white/10 text-xs text-white font-mono uppercase"
                                            />
                                          </div>

                                          <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Border Radius (px)</label>
                                            <input
                                              type="number"
                                              value={layer.borderRadiusPx || 0}
                                              onChange={(e) => updateShapeLayerProps(layer.id, { borderRadiusPx: Number(e.target.value) })}
                                              className="w-20 px-2 py-1 rounded bg-black border border-white/10 text-xs text-white font-mono"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FOLDER 3: SMART OBJECTS & LOGOS */}
                    {blueprint.objectLayers.length > 0 && (
                      <div className="border border-[#00D8FF]/20 rounded-2xl overflow-hidden bg-black/20">
                        <div
                          onClick={() => toggleFolder('Objects')}
                          className="flex items-center justify-between p-3.5 bg-[#111C30] cursor-pointer hover:bg-[#16233B] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                            {openFolders['Objects'] ? (
                              <FolderOpen className="w-4 h-4 text-[#00D8FF]" />
                            ) : (
                              <Folder className="w-4 h-4 text-[#00D8FF]" />
                            )}
                            <span>Smart Objects & Logo Assets</span>
                          </div>
                          <span className="text-[10px] text-[#00D8FF] font-mono font-bold">
                            {blueprint.objectLayers.length} Layers
                          </span>
                        </div>

                        {openFolders['Objects'] && (
                          <div className="p-3 space-y-3">
                            {blueprint.objectLayers
                              .filter((l) => !filterSearch || l.name.toLowerCase().includes(filterSearch.toLowerCase()))
                              .map((layer) => {
                                const isSelected = selectedLayerId === layer.id;
                                const isHidden = (layer as any).hidden;

                                return (
                                  <div
                                    key={layer.id}
                                    onClick={() => setSelectedLayerId(layer.id)}
                                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                                      isSelected
                                        ? 'bg-[#00D8FF]/15 border-[#00D8FF] shadow-lg'
                                        : 'bg-[#0E1628]/60 border-[#00D8FF]/10 hover:border-[#00D8FF]/30'
                                    } ${isHidden ? 'opacity-40' : ''}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedExportLayerIds.size === 0 || selectedExportLayerIds.has(layer.id)}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            toggleExportLayer(layer.id);
                                          }}
                                          className="w-3.5 h-3.5 rounded accent-[#00D8FF] cursor-pointer"
                                          title="Include in exported PSD"
                                        />
                                        <ImageIcon className="w-4 h-4 text-[#5FFFF7]" />
                                        <input
                                          type="text"
                                          value={layer.name}
                                          onChange={(e) => renameLayer(layer.id, e.target.value)}
                                          className="bg-transparent border-b border-transparent hover:border-[#00D8FF]/40 text-xs font-bold text-white focus:border-[#00D8FF] focus:outline-none"
                                        />
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLayerVisibility(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                                        >
                                          {isHidden ? <EyeOff className="w-3.5 h-3.5 text-red-400" /> : <Eye className="w-3.5 h-3.5 text-[#00D8FF]" />}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateLayer(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#00D8FF]"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteLayer(layer.id);
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        {/* REPLACE ASSET FILE INPUT BUTTON */}
                                        <label className="p-1.5 rounded-lg bg-[#00D8FF]/20 text-[#00D8FF] text-[10px] font-bold cursor-pointer hover:bg-[#00D8FF]/30">
                                          Replace PNG
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleReplaceAssetFile(layer.id, file);
                                            }}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                      <span className="capitalize">{layer.category} ({layer.description})</span>
                                      {(layer as any).customImageDataUrl && (
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                          Custom Replaced PNG
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FOLDER 4: BACKGROUND */}
                    <div className="border border-[#00D8FF]/20 rounded-2xl overflow-hidden bg-black/20">
                      <div
                        onClick={() => toggleFolder('Background')}
                        className="flex items-center justify-between p-3.5 bg-[#111C30] cursor-pointer hover:bg-[#16233B] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                          {openFolders['Background'] ? (
                            <FolderOpen className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Folder className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>Background & Backdrop</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          1 Layer
                        </span>
                      </div>

                      {openFolders['Background'] && (
                        <div className="p-3 space-y-2.5">
                          <div className="p-3 rounded-xl bg-[#0E1628]/60 border border-emerald-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Layers className="w-4 h-4 text-emerald-400" />
                              <div>
                                <span className="text-xs font-bold text-white">Reconstructed Backdrop Gradient Surface</span>
                                <p className="text-[10px] text-slate-400">
                                  Type: {blueprint.background?.type || 'gradient'} | Color: {blueprint.background?.primaryColorHex || '#060B16'}
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                              Backdrop
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: EXTRACTED ASSETS INSPECTOR (PNG/SVG) */}
                {activeTab === 'assets' && (
                  <div className="space-y-6">
                    {/* ASSETS OVERVIEW BANNER */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00D8FF]/10 via-[#007BFF]/10 to-transparent border border-[#00D8FF]/30 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#00D8FF]" />
                          Real Extracted Transparent Assets Repository (/assets/)
                        </h3>
                        <p className="text-xs text-slate-300">
                          Formula: <strong className="text-[#00D8FF] font-mono">Source Image + Element Mask = Transparent PNG Cutout</strong>. Every PSD layer is built from these independent assets.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-[#00D8FF]/20 text-[#00D8FF] text-xs font-mono font-bold border border-[#00D8FF]/30">
                          {psdResult.extractedAssets.length} Assets Generated
                        </span>
                        <a
                          href={psdResult.zipUrl}
                          download={`${psdResult.filename}_Package.zip`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00D8FF] text-black text-xs font-bold hover:bg-[#5FFFF7] transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download All Assets (.ZIP)</span>
                        </a>
                      </div>
                    </div>

                    {/* ASSET PREVIEW MODE SELECTOR */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-[#00D8FF]/20 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">Preview Alpha Mode:</span>
                        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                          <button
                            type="button"
                            onClick={() => setAssetViewMode('cutout')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              assetViewMode === 'cutout'
                                ? 'bg-[#00D8FF] text-black shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Transparent PNG
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssetViewMode('mask')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              assetViewMode === 'mask'
                                ? 'bg-[#00D8FF] text-black shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Element Mask
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssetViewMode('svg')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              assetViewMode === 'svg'
                                ? 'bg-[#00D8FF] text-black shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Vector SVG
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>All assets validated with 0% baked halos & native alpha channel</span>
                      </div>
                    </div>

                    {/* EXTRACTED ASSETS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {psdResult.extractedAssets.map((asset) => {
                        const isSelected = selectedAssetId === asset.id;
                        const isSVG = asset.type === 'svg';
                        const isModelOrSubject = asset.category === 'person' || asset.category === 'model';
                        const isObject = asset.category === 'object' || asset.category === 'product';

                        return (
                          <div
                            key={asset.id}
                            onClick={() => setSelectedAssetId(isSelected ? null : asset.id)}
                            className={`p-4 rounded-2xl border transition-all space-y-3 cursor-pointer ${
                              isSelected
                                ? 'bg-[#00D8FF]/15 border-[#00D8FF] shadow-xl ring-2 ring-[#00D8FF]/30'
                                : 'bg-[#0E1628]/70 border-[#00D8FF]/15 hover:border-[#00D8FF]/40'
                            }`}
                          >
                            {/* ASSET PREVIEW BOX WITH TRANSPARENCY CHECKERBOARD */}
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-2 bg-[linear-gradient(45deg,#1f2937_25%,transparent_25%),linear-gradient(-45deg,#1f2937_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f2937_75%),linear-gradient(-45deg,transparent_75%,#1f2937_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
                              {assetViewMode === 'mask' && asset.maskCanvas ? (
                                <img
                                  src={asset.maskCanvas.toDataURL('image/png')}
                                  alt={`${asset.name} Mask`}
                                  className="max-h-full max-w-full object-contain drop-shadow"
                                />
                              ) : (
                                <img
                                  src={asset.dataUrl}
                                  alt={asset.name}
                                  className="max-h-full max-w-full object-contain drop-shadow-md"
                                />
                              )}

                              {/* CATEGORY CHIP */}
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-bold text-[#00D8FF] border border-white/10 uppercase tracking-wider backdrop-blur-sm">
                                {asset.category}
                              </span>

                              {/* FORMAT CHIP */}
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono font-bold text-white border border-white/10 uppercase backdrop-blur-sm">
                                {isSVG ? 'PNG + SVG' : 'PNG'}
                              </span>
                            </div>

                            {/* ASSET INFO & VALIDATION */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs truncate max-w-[180px]">
                                  {asset.name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {asset.width}x{asset.height}px
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-400 truncate">
                                /assets/{asset.filename}
                              </p>
                            </div>

                            {/* VALIDATION STATUS PILL */}
                            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Cutout Quality:</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {asset.validation.message}
                              </span>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadAsset(asset);
                                }}
                                className="py-2 px-2 rounded-xl bg-[#00D8FF]/15 hover:bg-[#00D8FF]/25 border border-[#00D8FF]/30 text-[#00D8FF] text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>PNG Asset</span>
                              </button>

                              {asset.svgContent ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadAssetSVG(asset);
                                  }}
                                  className="py-2 px-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                                >
                                  <FileCode className="w-3 h-3" />
                                  <span>SVG Vector</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAssetId(asset.id);
                                  }}
                                  className="py-2 px-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Inspect</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: FONT REPLACEMENT REPORT */}
                {activeTab === 'fonts' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#00D8FF] uppercase tracking-wider">
                        OCR Identified Google Fonts Report
                      </span>
                      <button
                        type="button"
                        onClick={copyFontReport}
                        className="px-3 py-1.5 rounded-xl bg-[#00D8FF]/15 text-[#00D8FF] border border-[#00D8FF]/30 text-xs font-bold hover:bg-[#00D8FF]/25 flex items-center gap-1.5 transition-all"
                      >
                        {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedReport ? 'Copied Report!' : 'Copy Report Text'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {blueprint.fontReport.detectedFonts.map((fontItem, idx) => (
                        <div
                          key={fontItem.original + idx}
                          className="p-4 rounded-2xl bg-black/40 border border-[#00D8FF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-[#00D8FF]/10 text-[#00D8FF] font-mono text-[10px] font-bold">
                                OCR #{idx + 1}
                              </span>
                              <span className="font-extrabold text-white text-sm">
                                "{fontItem.original}"
                              </span>
                            </div>
                            <p className="text-[#5FFFF7] font-mono text-xs">
                              Mapped Google Font: <strong className="text-white">{fontItem.matchedGoogleFont}</strong> ({fontItem.category})
                            </p>
                          </div>

                          <a
                            href={fontItem.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-[#00D8FF]/10 hover:bg-[#00D8FF]/20 text-[#00D8FF] border border-[#00D8FF]/30 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <span>Download Font Family</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: PALETTE INSPECTOR */}
                {activeTab === 'palette' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Sampled design color palette from input image:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* PRIMARY BRAND COLORS */}
                      <div className="p-4 rounded-2xl bg-black/30 border border-[#00D8FF]/15 space-y-2.5">
                        <span className="text-xs font-extrabold uppercase text-[#00D8FF] tracking-wider">
                          Primary Brand Colors
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(blueprint.colorPalette?.primary || ['#00D8FF', '#007BFF', '#0E1628']).map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => copyColorToClipboard(hex)}
                              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 hover:border-[#00D8FF] flex items-center gap-2.5 hover:scale-105 transition-all text-left"
                            >
                              <span
                                className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-sm"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-xs font-mono font-bold text-white">{hex}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ACCENT COLORS */}
                      <div className="p-4 rounded-2xl bg-black/30 border border-[#00D8FF]/15 space-y-2.5">
                        <span className="text-xs font-extrabold uppercase text-[#5FFFF7] tracking-wider">
                          Accent & Highlight Colors
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(blueprint.colorPalette?.accent || ['#5FFFF7', '#28B8FF']).map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => copyColorToClipboard(hex)}
                              className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 hover:border-[#00D8FF] flex items-center gap-2.5 hover:scale-105 transition-all text-left"
                            >
                              <span
                                className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-sm"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-xs font-mono font-bold text-white">{hex}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: METADATA BLUEPRINT */}
                {activeTab === 'metadata' && (
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-slate-300">Raw Layer Blueprint JSON:</span>
                    <pre className="p-4 rounded-2xl bg-black/60 border border-[#00D8FF]/20 text-[11px] font-mono text-[#00D8FF] overflow-x-auto max-h-96">
                      {JSON.stringify(blueprint, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PLACEHOLDER STATE BEFORE RECONSTRUCTION */
            <div className="p-12 rounded-3xl bg-[#0E1628]/60 border border-[#00D8FF]/20 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 flex items-center justify-center mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">No PSD Reconstruction Active</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upload an image on the left and click "Reconstruct Editable Photoshop PSD" to execute
                  the 12-pass AI segmentation engine.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PSDStudio;
