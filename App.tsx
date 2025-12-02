import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Users, 
  Wand2, 
  Code2, 
  History, 
  Menu, 
  Zap,
  Sparkles,
  Download,
  Trash2,
  ChevronRight,
  Layers,
  Lock,
  ShieldCheck,
  Fingerprint,
  Film,
  Clapperboard,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Cpu,
  RefreshCw,
  Maximize,
  SlidersHorizontal,
  Box,
  RectangleHorizontal,
  RectangleVertical,
  Grid3X3,
  Upload,
  Play,
  X,
  Copy,
  Settings,
  Aperture,
  Sun,
  Droplets,
  List,
  FileText,
  Paintbrush,
  Move,
  ScanFace,
  Scaling
} from 'lucide-react';
import { AppState, AppView, Character, GenerationItem, AspectRatio } from './types';
import { trainCharacterIdentity, generateCreativeImage, editImageUtility, generateComponentCode, generateScriptToStory, generateStoryFromPrompts } from './services/geminiService';

// --- UI Primitives (Obsidian & Amber 3D System) ---

const Button3D: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
  // Base 3D Button Structure
  const baseStyles = "relative font-bold py-3 px-6 rounded-xl transition-all duration-200 active:translate-y-1 active:shadow-none focus:outline-none flex items-center justify-center gap-2 select-none overflow-hidden group border-t border-white/10";
  const disabledStyles = "opacity-50 cursor-not-allowed border-b-0 translate-y-1 bg-stone-800 text-stone-500 shadow-none";
  
  // Theme Variants
  const variants = {
    // Primary: Glowing Amber (Energy)
    primary: "bg-gradient-to-b from-amber-500 to-amber-600 text-white border-b-4 border-amber-800 shadow-[0_8px_0_rgb(146,64,14),0_15px_20px_rgba(0,0,0,0.4)] hover:brightness-110",
    // Secondary: Polished Zinc (Metal)
    secondary: "bg-gradient-to-b from-stone-700 to-stone-800 text-stone-200 border-b-4 border-stone-950 shadow-[0_8px_0_rgb(12,10,9),0_15px_20px_rgba(0,0,0,0.4)] hover:bg-stone-600",
    // Danger: Ruby (Alert)
    danger: "bg-gradient-to-b from-red-600 to-red-700 text-white border-b-4 border-red-900 shadow-[0_8px_0_rgb(127,29,29),0_15px_20px_rgba(0,0,0,0.4)] hover:brightness-110",
    // Accent: White Gold (Premium)
    accent: "bg-gradient-to-b from-yellow-100 to-yellow-200 text-amber-900 border-b-4 border-yellow-600 shadow-[0_8px_0_rgb(202,138,4),0_15px_20px_rgba(0,0,0,0.4)] hover:brightness-110",
    // Ghost: Transparent (Glass)
    ghost: "bg-transparent text-stone-400 hover:text-white hover:bg-white/5 border-b-0 py-2 active:bg-white/10 shadow-none" 
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? disabledStyles : variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {/* Glossy Top Sheen */}
      {!disabled && variant !== 'ghost' && (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-t-xl" />
      )}
      <span className="relative z-10 flex items-center gap-2 drop-shadow-md">{children}</span>
    </button>
  );
};

const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`backdrop-blur-xl bg-stone-900/60 border border-white/10 shadow-2xl rounded-2xl relative overflow-hidden ${className}`}>
    {/* Noise Texture */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none mix-blend-overlay" />
    {/* Specular Highlight on Edges */}
    <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
    <div className="relative z-10">{children}</div>
  </div>
);

const RangeSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  disabled?: boolean;
}> = ({ label, value, min, max, step = 1, onChange, formatValue, disabled = false }) => (
  <div className={`space-y-3 group ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-stone-500 group-hover:text-stone-300 transition-colors">
      <span>{label}</span>
      <span className="text-amber-500 font-mono bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">{formatValue ? formatValue(value) : value}</span>
    </div>
    <div className="relative h-8 flex items-center cursor-pointer">
      {/* Track */}
      <div className="absolute w-full h-3 bg-stone-950 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border-b border-white/5" />
      {/* Fill */}
      <div 
        className="absolute h-3 bg-gradient-to-r from-stone-700 to-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      {/* Thumb Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-pointer z-20"
      />
      {/* Visual Thumb */}
      <div 
        className="absolute h-6 w-6 bg-gradient-to-b from-stone-200 to-stone-400 border-2 border-stone-100 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] pointer-events-none transition-all duration-75 ease-out z-10"
        style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 12px)` }}
      >
        <div className="absolute inset-0.5 rounded-full border border-stone-400" />
      </div>
    </div>
  </div>
);

const Select3D: React.FC<{
    label: string;
    icon?: React.ElementType;
    value: string;
    options: string[];
    onChange: (val: string) => void;
}> = ({ label, icon: Icon, value, options, onChange }) => (
    <div className="space-y-2">
       <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
          {Icon && <Icon size={12} />} {label}
       </label>
       <div className="relative">
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm text-white outline-none cursor-pointer hover:bg-stone-800 transition-colors shadow-inner"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                <ChevronRight size={16} className="rotate-90" />
            </div>
       </div>
    </div>
);

const AspectRatioSelector: React.FC<{ value: AspectRatio; onChange: (val: AspectRatio) => void }> = ({ value, onChange }) => {
  const ratios = [
    { id: '1:1', label: 'Square', icon: Box, aspect: 'aspect-square' },
    { id: '16:9', label: 'Wide', icon: RectangleHorizontal, aspect: 'aspect-video' },
    { id: '9:16', label: 'Mobile', icon: RectangleVertical, aspect: 'aspect-[9/16]' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Aspect Ratio</label>
      <div className="grid grid-cols-3 gap-3">
        {ratios.map((r) => (
          <button
            key={r.id}
            onClick={() => onChange(r.id as AspectRatio)}
            className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border-b-4 transition-all duration-200 active:translate-y-1 active:border-b-0 ${
              value === r.id
                ? 'bg-stone-800 border-amber-600 shadow-[0_5px_15px_rgba(245,158,11,0.2)]'
                : 'bg-stone-900 border-stone-950 hover:bg-stone-800'
            }`}
          >
            <r.icon size={20} className={`mb-2 ${value === r.id ? 'text-amber-500' : 'text-stone-500 group-hover:text-stone-300'} `} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${value === r.id ? 'text-white' : 'text-stone-500'}`}>{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const DragDropZone: React.FC<{ 
    onFilesSelected: (files: string[]) => void; 
    multiple?: boolean;
    label?: string;
    subLabel?: string;
    icon?: React.ElementType;
    compact?: boolean;
}> = ({ onFilesSelected, multiple = true, label = "Drop files here", subLabel, icon: Icon = Upload, compact = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const processFiles = (fileList: FileList) => {
        const filesArr = Array.from(fileList);
        const readers = filesArr.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });
        Promise.all(readers).then(imgs => {
            if (multiple) onFilesSelected(imgs);
            else onFilesSelected([imgs[0]]);
        });
    };

    return (
        <div 
            className={`relative group border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden ${
                isDragging 
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' 
                    : 'border-stone-800 bg-stone-900/50 hover:bg-stone-900 hover:border-stone-600'
            } ${compact ? 'p-3' : 'p-8'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input 
                type="file" 
                multiple={multiple} 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileInput} 
                accept="image/*"
            />
            <div className={`flex flex-col items-center justify-center text-center ${compact ? 'gap-1' : 'gap-4'}`}>
                <div className={`rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${compact ? 'w-8 h-8 bg-stone-800' : 'w-16 h-16 bg-stone-800'}`}>
                    <Icon className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} ${isDragging ? 'text-amber-500' : 'text-stone-500 group-hover:text-stone-300'} `} />
                </div>
                <div>
                    <p className={`font-bold text-stone-300 ${compact ? 'text-[10px]' : 'text-sm'}`}>{label}</p>
                    {subLabel && <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wide">{subLabel}</p>}
                </div>
            </div>
        </div>
    );
};

// --- Feature Components ---

const SecurityGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<'LOCKED' | 'VERIFYING' | 'GRANTED'>('LOCKED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('VERIFYING');
    
    setTimeout(() => {
      if (code.toLowerCase() === 'umaismusk') {
        setStatus('GRANTED');
        setTimeout(onUnlock, 1200);
      } else {
        setStatus('LOCKED');
        setError(true);
        setCode('');
        setTimeout(() => setError(false), 800);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0a09] overflow-hidden font-mono">
      {/* Luxurious Dark Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#292524_0%,_#0c0a09_100%)]" />
      
      {/* Amber Light Leak */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      <GlassPanel className={`w-full max-w-md p-10 m-4 transition-all duration-500 ${error ? 'border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.3)] translate-x-2' : 'border-white/10'}`}>
        <div className="flex flex-col items-center space-y-10">
          
          {/* Status Icon */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-2xl border-t border-white/10 ${status === 'GRANTED' ? 'bg-emerald-900/50 text-emerald-400' : error ? 'bg-red-900/50 text-red-500' : 'bg-stone-900/80 text-amber-500'}`}>
              {status === 'GRANTED' ? <CheckCircle2 size={48} /> : error ? <AlertCircle size={48} /> : <Lock size={48} />}
            </div>
            {/* Spinning Ring */}
            {status === 'VERIFYING' && (
              <div className="absolute inset-0 -m-2 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-[0.3em] text-white">RESTRICTED</h2>
            <p className={`text-xs uppercase tracking-widest font-bold ${error ? 'text-red-400' : 'text-stone-500'}`}>
              {error ? 'Access Denied' : status === 'GRANTED' ? 'Identity Verified' : 'Enter Security Clearance'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div className="relative group">
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-black/40 border-2 border-stone-800 text-center text-2xl tracking-[0.5em] text-amber-100 rounded-xl py-5 px-4 focus:outline-none focus:border-amber-500/50 focus:bg-black/60 focus:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all placeholder:text-stone-800 font-bold"
                placeholder="••••••••"
                autoFocus
                disabled={status !== 'LOCKED'}
              />
            </div>
            
            <Button3D 
              fullWidth 
              variant={status === 'GRANTED' ? 'accent' : error ? 'danger' : 'primary'}
              disabled={status !== 'LOCKED'}
              className="py-4 text-lg"
            >
              {status === 'VERIFYING' ? 'DECRYPTING...' : status === 'GRANTED' ? 'WELCOME USER' : 'AUTHENTICATE'}
            </Button3D>
          </form>
        </div>
      </GlassPanel>
      
      <div className="absolute bottom-10 text-center space-y-2 opacity-30">
        <ShieldCheck className="w-6 h-6 mx-auto mb-2" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400">Horizon Security Layer 4.0</p>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-stone-800 text-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_20px_-5px_rgba(0,0,0,0.5)] border border-stone-700' 
        : 'hover:bg-stone-800/50 text-stone-500 hover:text-stone-200 border border-transparent'
    }`}
  >
    <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-amber-500/10' : 'bg-transparent'}`}>
       <Icon size={20} className={active ? 'text-amber-500' : 'text-stone-500 group-hover:text-stone-300'} />
    </div>
    <span className={`font-bold tracking-wide text-sm ${active ? 'text-stone-100' : 'text-stone-500 group-hover:text-stone-300'}`}>
      {label}
    </span>
    {/* Active Indicator Bar */}
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
    )}
  </button>
);

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [view, setView] = useState<AppView>(AppView.IDENTITY);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [credits, setCredits] = useState(100);
  const [history, setHistory] = useState<GenerationItem[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  // Identity Studio State
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [charName, setCharName] = useState('');

  // Canvas State
  const [prompt, setPrompt] = useState('');
  const [negPrompt, setNegPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [stylePreset, setStylePreset] = useState('Cinematic');
  const [guidance, setGuidance] = useState(7);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const [batchSize, setBatchSize] = useState(1);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  
  // Advanced Controls State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lighting, setLighting] = useState('Studio Balanced');
  const [camera, setCamera] = useState('35mm Prime');
  const [colorGrade, setColorGrade] = useState('Standard');

  // Story / YouTube State
  const [script, setScript] = useState('');
  const [storyInputMode, setStoryInputMode] = useState<'SCRIPT' | 'BULK'>('SCRIPT');
  const [storyFrames, setStoryFrames] = useState<string[]>([]);
  const [storyFrameCount, setStoryFrameCount] = useState(4);
  const [storyBgRef, setStoryBgRef] = useState<string | null>(null);
  const [storyStyleRef, setStoryStyleRef] = useState<string | null>(null); // New Style Ref
  const [storyAspectRatio, setStoryAspectRatio] = useState<AspectRatio>('16:9');
  const [isPreviewingVideo, setIsPreviewingVideo] = useState(false);
  const [currentVideoFrame, setCurrentVideoFrame] = useState(0);

  // Utility Lab State
  const [utilityTool, setUtilityTool] = useState<'ASPECT' | 'FACESWAP' | 'UPSCALE'>('ASPECT');
  const [utilBaseImage, setUtilBaseImage] = useState<string | null>(null);
  const [utilSecondaryImage, setUtilSecondaryImage] = useState<string | null>(null);
  const [utilResult, setUtilResult] = useState<string | null>(null);
  const [utilAspectRatio, setUtilAspectRatio] = useState<AspectRatio>('16:9');

  // Handlers
  const handleTrainCharacter = async () => {
    if (!charName || uploadImages.length === 0) return;
    setLoading(true);
    try {
      const newChar = await trainCharacterIdentity(charName, uploadImages);
      setCharacters([...characters, newChar]);
      setUploadImages([]);
      setCharName('');
      setSelectedCharId(newChar.id);
      setView(AppView.CANVAS); 
    } catch (e) {
      alert("Training failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const activeChar = characters.find(c => c.id === selectedCharId);
      
      // Batch Generation Loop
      const newHistoryItems: GenerationItem[] = [];
      let lastImage = '';

      const promises = [];
      for (let i = 0; i < batchSize; i++) {
        const currentSeed = seed + i;
        promises.push(
             generateCreativeImage(
                prompt, 
                aspectRatio, 
                stylePreset,
                {
                    negativePrompt: negPrompt,
                    character: activeChar,
                    guidance,
                    seed: currentSeed,
                    lighting: showAdvanced ? lighting : undefined,
                    camera: showAdvanced ? camera : undefined,
                    colorGrade: showAdvanced ? colorGrade : undefined
                }
            )
        );
      }

      const results = await Promise.all(promises);

      results.forEach((res, i) => {
          if (res) {
            lastImage = res;
            newHistoryItems.push({
                id: Date.now().toString() + i, 
                type: 'image', 
                content: res, 
                prompt, 
                timestamp: Date.now(),
                metadata: { model: 'gemini-2.5-flash-image', style: stylePreset, characterId: activeChar?.id }
            });
          }
      });

      if (lastImage) setGeneratedResult(lastImage); 
      setCredits(c => c - batchSize);
      setHistory(prev => [...newHistoryItems, ...prev]);

    } catch (e) {
      console.error(e);
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryGenerate = async () => {
    if (!script) return;
    setLoading(true);
    
    // Determine the total for progress based on mode
    const bulkPrompts = script.split('\n').filter(s => s.trim().length > 0);
    const totalFrames = storyInputMode === 'BULK' ? bulkPrompts.length : storyFrameCount;

    setProgress({ current: 0, total: totalFrames });
    try {
      const activeChar = characters.find(c => c.id === selectedCharId);
      let frames: string[] = [];

      if (storyInputMode === 'BULK') {
          // DIRECT BULK MODE
          frames = await generateStoryFromPrompts(
              bulkPrompts,
              activeChar,
              storyBgRef || undefined,
              storyStyleRef || undefined,
              stylePreset,
              storyAspectRatio,
              {
                lighting: showAdvanced ? lighting : undefined,
                camera: showAdvanced ? camera : undefined,
                colorGrade: showAdvanced ? colorGrade : undefined
              },
              (completed, total) => setProgress({ current: completed, total })
          );
      } else {
          // AUTO SCRIPT MODE
          frames = await generateScriptToStory(
            script, 
            storyFrameCount, 
            activeChar, 
            storyBgRef || undefined, 
            storyStyleRef || undefined,
            stylePreset, 
            storyAspectRatio,
            {
                lighting: showAdvanced ? lighting : undefined,
                camera: showAdvanced ? camera : undefined,
                colorGrade: showAdvanced ? colorGrade : undefined
            },
            (completed, total) => setProgress({ current: completed, total })
          );
      }
      
      setStoryFrames(frames);
      setCredits(c => c - frames.length);
      
      if (frames.length > 0) {
        setHistory([
            {
            id: Date.now().toString(),
            type: 'story',
            content: frames,
            prompt: script.substring(0, 50) + "...",
            timestamp: Date.now(),
            metadata: { model: 'gemini-2.5-flash', style: stylePreset }
            },
            ...history
        ]);
      }
    } catch (e) {
      console.error(e);
      alert("Story generation failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleUtilityAction = async () => {
    if (!utilBaseImage) return;
    setLoading(true);
    try {
        let op: 'FACESWAP' | 'UPSCALE' | 'BACKGROUND' | 'ASPECT_SHIFT' = 'UPSCALE';
        const params: any = {};

        if (utilityTool === 'FACESWAP') {
            op = 'FACESWAP';
            if (utilSecondaryImage) params.secondaryImage = utilSecondaryImage;
        } else if (utilityTool === 'ASPECT') {
            op = 'ASPECT_SHIFT';
            params.targetAspectRatio = utilAspectRatio;
        }

        const res = await editImageUtility(utilBaseImage, op, params);
        setUtilResult(res);
        setCredits(c => c - 2); // Utility costs more
    } catch (e) {
        alert("Operation failed");
    } finally {
        setLoading(false);
    }
  };

  const downloadImage = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `horizon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
      for (let i = 0; i < storyFrames.length; i++) {
        downloadImage(storyFrames[i], `sequence-${i+1}.png`);
        await new Promise(r => setTimeout(r, 200));
      }
  };

  useEffect(() => {
    let interval: any;
    if (isPreviewingVideo && storyFrames.length > 0) {
      interval = setInterval(() => {
        setCurrentVideoFrame(prev => (prev + 1) % storyFrames.length);
      }, 2000); 
    }
    return () => clearInterval(interval);
  }, [isPreviewingVideo, storyFrames]);

  const getGridAspectClass = (ratio: AspectRatio) => {
    switch (ratio) {
        case '9:16': return 'aspect-[9/16]';
        case '1:1': return 'aspect-square';
        case '16:9': default: return 'aspect-video';
    }
  };

  if (isLocked) {
    return <SecurityGate onUnlock={() => setIsLocked(false)} />;
  }

  // Common UI Section for Advanced Controls
  const AdvancedControls = () => (
    <div className={`space-y-4 pt-4 border-t border-white/5 transition-all duration-300 ${showAdvanced ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <Select3D 
            label="Lighting Engine" 
            icon={Sun}
            value={lighting} 
            onChange={setLighting} 
            options={['Studio Balanced', 'Rembrandt', 'Cinematic Volumetric', 'Cyberpunk Neon', 'Natural Sunlight', 'Dark Noir', 'Golden Hour', 'Flat Lighting']} 
        />
        <Select3D 
            label="Optical Lens" 
            icon={Aperture}
            value={camera} 
            onChange={setCamera} 
            options={['35mm Prime', '85mm Portrait', '24mm Wide Angle', 'Telephoto Zoom', 'Fish-eye', 'Macro Close-up', 'Drone Shot', 'Security Camera']} 
        />
        <Select3D 
            label="Color Grade" 
            icon={Droplets}
            value={colorGrade} 
            onChange={setColorGrade} 
            options={['Standard', 'Vibrant', 'Muted / Desaturated', 'Warm Vintage', 'Cool Blue', 'Black & White', 'Sepia', 'Teal & Orange']} 
        />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0c0a09] text-stone-100 overflow-hidden font-sans selection:bg-amber-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-stone-900/0 to-transparent blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800/20 via-transparent to-transparent blur-[100px]" />
      </div>

      {/* Navigation (Sidebar Desktop / Bottom Mobile) */}
      <div className="relative z-20 lg:h-full lg:p-4 flex flex-col justify-center flex-shrink-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-full flex-col">
            <GlassPanel className="w-64 h-full flex flex-col p-4">
            <div className="mb-8 px-2 pt-2 text-center">
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400 tracking-tighter drop-shadow-sm uppercase">
                Horizon<span className="text-amber-500">.Lab</span>
                </h1>
                <p className="text-[10px] text-stone-500 mt-2 font-bold tracking-[0.2em] uppercase">By Shaikh Aliakbar</p>
            </div>

            <nav className="flex-1 space-y-3">
                <SidebarItem icon={Users} label="Identity" active={view === AppView.IDENTITY} onClick={() => setView(AppView.IDENTITY)} />
                <SidebarItem icon={Palette} label="Canvas" active={view === AppView.CANVAS} onClick={() => setView(AppView.CANVAS)} />
                <SidebarItem icon={Film} label="YouTube Studio" active={view === AppView.STORY} onClick={() => setView(AppView.STORY)} />
                <div className="h-px bg-white/5 my-4 mx-2" />
                <SidebarItem icon={Wand2} label="Utility Lab" active={view === AppView.UTILITY} onClick={() => setView(AppView.UTILITY)} />
                <SidebarItem icon={Code2} label="Code Gen" active={view === AppView.CODE} onClick={() => setView(AppView.CODE)} />
                <SidebarItem icon={History} label="Archives" active={view === AppView.HISTORY} onClick={() => setView(AppView.HISTORY)} />
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Credits</span>
                <span className="text-xs font-mono text-amber-500">{credits}</span>
                </div>
                <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 w-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                    style={{ width: `${credits}%` }}
                />
                </div>
            </div>
            </GlassPanel>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 lg:p-6 lg:pl-0 pb-24 lg:pb-6 custom-scrollbar">
        
        {/* VIEW: IDENTITY STUDIO */}
        {view === AppView.IDENTITY && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 gap-4">
              <div>
                <h2 className="text-3xl lg:text-4xl font-thin text-white tracking-wide">Identity <span className="font-bold text-amber-500">Core</span></h2>
                <p className="text-stone-400 mt-2 text-sm lg:text-lg">Train persistent neural character models.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Train Panel */}
              <GlassPanel className="lg:col-span-4 p-8 space-y-8 h-fit">
                 <div className="space-y-4">
                   <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">Designation Name</label>
                   <input 
                      type="text" 
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-white focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600/50 transition-all placeholder:text-stone-700"
                      placeholder="e.g. Project 77"
                   />
                 </div>
                 
                 <div className="space-y-4">
                   <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">Training Data (Faces)</label>
                   <DragDropZone 
                        onFilesSelected={(files) => setUploadImages(files)}
                        label="Drop face imagery here"
                        subLabel={`${uploadImages.length} Samples Loaded`}
                        icon={Users}
                   />
                 </div>

                 <Button3D 
                    fullWidth 
                    variant="primary"
                    onClick={handleTrainCharacter} 
                    disabled={loading || !charName || uploadImages.length === 0}
                 >
                    {loading ? 'Processing Neural Data...' : 'Initialize Training'}
                 </Button3D>
              </GlassPanel>

              {/* Gallery Panel */}
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                 {characters.length === 0 && (
                   <div className="col-span-full h-64 lg:h-96 flex flex-col items-center justify-center text-stone-600 border border-stone-800/50 rounded-2xl bg-stone-900/20">
                     <Users className="h-16 w-16 mb-6 opacity-20" />
                     <p className="font-mono text-sm">DATABASE EMPTY</p>
                   </div>
                 )}
                 {characters.map(char => (
                   <div 
                      key={char.id} 
                      onClick={() => setSelectedCharId(char.id)}
                      className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] ${selectedCharId === char.id ? 'ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border border-stone-800'}`}
                   >
                     <img src={char.thumbnail} alt={char.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                     <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="font-bold text-white text-base tracking-wide">{char.name}</p>
                        <p className="text-[10px] text-stone-400 line-clamp-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{char.description}</p>
                     </div>
                     {selectedCharId === char.id && (
                       <div className="absolute top-3 right-3 bg-amber-500 text-black p-1.5 rounded-full shadow-lg">
                         <CheckCircle2 size={16} strokeWidth={3} />
                       </div>
                     )}
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: GENERATION CANVAS */}
        {view === AppView.CANVAS && (
          <div className="flex flex-col-reverse lg:flex-row gap-6 h-full lg:h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Controls */}
             <GlassPanel className="w-full lg:w-[400px] flex-shrink-0 flex flex-col p-6 gap-6 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Input Directive</label>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-950/30 border border-amber-900 px-2 py-0.5 rounded">GEMINI 2.5</span>
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 bg-stone-950 border border-stone-800 rounded-xl p-4 text-white placeholder:text-stone-600 focus:border-amber-600 focus:outline-none resize-none shadow-inner text-sm leading-relaxed"
                    placeholder="Describe the visual output..."
                  />
                  <input 
                    type="text"
                    value={negPrompt}
                    onChange={(e) => setNegPrompt(e.target.value)}
                    placeholder="Negative constraints (e.g. blurry, distorted)"
                    className="w-full bg-stone-950/50 border border-stone-800 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-red-900/50 focus:text-red-100 transition-colors"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                   <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block">Subject Identity</label>
                   <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                      <button 
                        onClick={() => setSelectedCharId(null)}
                        className={`flex-shrink-0 h-14 w-14 rounded-xl border-2 flex items-center justify-center transition-all snap-start ${!selectedCharId ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-600'}`}
                      >
                        <Users size={20} />
                      </button>
                      {characters.map(char => (
                        <button 
                          key={char.id}
                          onClick={() => setSelectedCharId(char.id)}
                          className={`flex-shrink-0 h-14 w-14 rounded-xl border-2 overflow-hidden transition-all snap-start relative ${selectedCharId === char.id ? 'border-amber-500' : 'border-stone-800 hover:border-stone-500'}`}
                        >
                          <img src={char.thumbnail} className="w-full h-full object-cover" />
                          {selectedCharId === char.id && <div className="absolute inset-0 bg-amber-500/20" />}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-white/5">
                   <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

                   <Select3D 
                        label="Render Style" 
                        value={stylePreset} 
                        onChange={setStylePreset} 
                        options={['Cinematic', 'Pixar 3D', 'Photorealistic', '3D Render', 'Anime', 'Digital Art', 'Analog Film', 'Oil Painting', 'Sketch']} 
                   />

                   <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400"
                   >
                        <Settings size={14} /> Advanced Studio Controls {showAdvanced ? '(-)' : '(+)'}
                   </button>
                   
                   <AdvancedControls />

                   <RangeSlider label="Guidance Scale" value={guidance} min={1} max={20} onChange={setGuidance} />
                   <RangeSlider label="Batch Size" value={batchSize} min={1} max={5} onChange={setBatchSize} formatValue={(v) => `x${v}`} />
                </div>

                <div className="mt-auto pt-6 pb-6 lg:pb-0">
                  <Button3D fullWidth onClick={handleGenerate} disabled={loading || !prompt}>
                     {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                     ) : (
                        <>
                          <Zap size={18} className="fill-white" /> ENGAGE
                        </>
                     )}
                  </Button3D>
                </div>
             </GlassPanel>

             {/* Preview Area */}
             <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
                {/* Main Viewport */}
                <div className="flex-1 rounded-2xl border border-white/10 bg-stone-950/50 backdrop-blur relative flex items-center justify-center overflow-hidden group shadow-2xl">
                   {/* Grid Background */}
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                   
                   {generatedResult ? (
                     <div className="relative z-10 p-4 lg:p-8 w-full h-full flex items-center justify-center">
                        <img 
                          src={generatedResult} 
                          className="max-w-full max-h-full rounded-lg shadow-2xl animate-in fade-in zoom-in duration-500 border border-white/10" 
                        />
                        <div className="absolute bottom-8 flex gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all lg:translate-y-4 lg:group-hover:translate-y-0">
                          <Button3D variant="secondary" onClick={() => downloadImage(generatedResult!)}><Download size={18} /></Button3D>
                          <Button3D variant="secondary" onClick={() => handleGenerate()}><RefreshCw size={18} /></Button3D>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center opacity-20 pointer-events-none select-none relative z-10">
                        <Grid3X3 size={80} className="mx-auto mb-6 text-stone-500" strokeWidth={1} />
                        <h3 className="text-3xl font-thin tracking-widest uppercase">Canvas Idle</h3>
                     </div>
                   )}
                </div>

                {/* Batch Filmstrip (if batch > 1 or history) */}
                {history.length > 0 && (
                   <div className="h-24 bg-stone-900/40 rounded-xl border border-white/5 flex items-center p-2 gap-2 overflow-x-auto custom-scrollbar">
                      {history.filter(h => h.type === 'image').slice(0, 10).map((item) => (
                         <img 
                           key={item.id} 
                           src={item.content as string} 
                           onClick={() => setGeneratedResult(item.content as string)}
                           className={`h-full aspect-square object-cover rounded-lg cursor-pointer border-2 transition-all ${generatedResult === item.content ? 'border-amber-500' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                         />
                      ))}
                   </div>
                )}
             </div>
          </div>
        )}

        {/* VIEW: YOUTUBE STUDIO */}
        {view === AppView.STORY && (
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
             <header className="border-b border-white/5 pb-6 flex flex-col lg:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-thin text-white tracking-wide">YouTube <span className="font-bold text-amber-500">Studio</span></h2>
                    <p className="text-stone-400 mt-2 text-sm lg:text-lg">Automated narrative visualization engine.</p>
                </div>
                {storyFrames.length > 0 && (
                    <div className="flex gap-3">
                         <Button3D variant="secondary" onClick={handleDownloadAll}>
                            <Download size={18} /> DOWNLOAD ALL
                        </Button3D>
                        <Button3D variant="accent" onClick={() => setIsPreviewingVideo(true)}>
                            <Play size={18} /> PREVIEW VIDEO
                        </Button3D>
                    </div>
                )}
             </header>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <GlassPanel className="xl:col-span-1 p-6 flex flex-col gap-6 h-fit">
                  
                  {/* Mode Toggle */}
                  <div className="flex bg-stone-950/50 p-1 rounded-xl border border-white/5">
                      <button 
                         onClick={() => setStoryInputMode('SCRIPT')}
                         className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${storyInputMode === 'SCRIPT' ? 'bg-amber-500 text-black shadow' : 'text-stone-500 hover:text-stone-300'}`}
                      >
                         <FileText size={14} className="inline mr-1" /> Auto-Script
                      </button>
                      <button 
                         onClick={() => setStoryInputMode('BULK')}
                         className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${storyInputMode === 'BULK' ? 'bg-amber-500 text-black shadow' : 'text-stone-500 hover:text-stone-300'}`}
                      >
                         <List size={14} className="inline mr-1" /> Bulk Prompts
                      </button>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                            {storyInputMode === 'SCRIPT' ? 'Video Script / Narrative' : 'Manual Prompts (One per line)'}
                        </label>
                        {storyInputMode === 'BULK' && <span className="text-[10px] text-amber-500 font-bold bg-amber-900/20 px-2 py-0.5 rounded">AUTO-SPLIT ENABLED</span>}
                    </div>
                    <textarea 
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="w-full h-48 bg-stone-950 border border-stone-800 rounded-xl p-4 text-white placeholder:text-stone-700 focus:border-amber-600 focus:outline-none resize-none shadow-inner text-sm leading-relaxed"
                      placeholder={storyInputMode === 'SCRIPT' ? "Enter your story here. The AI will break it down..." : "Paste your prompts here.\nOne prompt per line.\nExample: A cat sitting on a wall.\nExample: The cat jumps down."}
                    />
                  </div>

                  <div className="space-y-6 border-t border-white/5 pt-6">
                     <AspectRatioSelector value={storyAspectRatio} onChange={setStoryAspectRatio} />
                     
                     <Select3D 
                        label="Visual Style" 
                        value={stylePreset} 
                        onChange={setStylePreset} 
                        options={['Cinematic', 'Pixar 3D', 'Photorealistic', '3D Render', 'Anime', 'Digital Art', 'Analog Film', 'Oil Painting', 'Sketch']} 
                   />

                     <RangeSlider 
                        label={storyInputMode === 'BULK' ? "Detected Frames" : "Sequence Length"} 
                        value={storyInputMode === 'BULK' ? (script.split('\n').filter(s => s.trim().length > 0).length || 1) : storyFrameCount} 
                        min={1} 
                        max={25} 
                        onChange={setStoryFrameCount}
                        disabled={storyInputMode === 'BULK'}
                        formatValue={(v) => `${v} Frames`}
                     />

                     <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400"
                   >
                        <Settings size={14} /> Pro Studio Settings {showAdvanced ? '(-)' : '(+)'}
                   </button>
                     <AdvancedControls />
                     
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Consistency Anchors</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           {/* Character Anchor */}
                           <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center h-full">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedCharId ? 'bg-amber-500/20 text-amber-500' : 'bg-stone-800 text-stone-600'}`}>
                                 <Users size={20} />
                              </div>
                              <div className="min-w-0 w-full">
                                 <p className="text-[10px] uppercase text-stone-500 font-bold">Actor</p>
                                 <p className="text-xs text-stone-300 truncate w-full">{selectedCharId ? characters.find(c => c.id === selectedCharId)?.name : "None"}</p>
                              </div>
                           </div>
                           
                           {/* Background Anchor */}
                           <DragDropZone 
                                compact
                                multiple={false}
                                onFilesSelected={(files) => setStoryBgRef(files[0])}
                                label={storyBgRef ? "BG Set" : "BG Ref"}
                                icon={ImageIcon}
                           />

                           {/* Style Anchor */}
                           <DragDropZone 
                                compact
                                multiple={false}
                                onFilesSelected={(files) => setStoryStyleRef(files[0])}
                                label={storyStyleRef ? "Style Set" : "Style Ref"}
                                icon={Paintbrush}
                           />
                        </div>
                     </div>
                  </div>

                  <Button3D variant="primary" fullWidth onClick={handleStoryGenerate} disabled={loading || !script}>
                    {loading ? (
                       <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
                          {progress ? `Rendering Frame ${progress.current}/${progress.total}` : 'Analyzing...'}
                       </span>
                    ) : 'Generate Sequence'}
                  </Button3D>
                </GlassPanel>

                <div className="xl:col-span-2 space-y-4">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-widest px-1">
                    <span>Timeline Output</span>
                    <span>{storyFrames.length > 0 ? `${storyFrames.length} Frames` : 'Standby'}</span>
                  </div>
                  
                  {storyFrames.length > 0 ? (
                    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 h-[600px] overflow-y-auto custom-scrollbar p-1`}>
                      {storyFrames.map((frame, idx) => (
                        <div key={idx} className={`group relative ${getGridAspectClass(storyAspectRatio)} rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all bg-stone-900`}>
                          <img src={frame} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">
                            SEQ {idx + 1}
                          </div>
                          <button 
                            onClick={() => downloadImage(frame, `frame-${idx+1}.png`)}
                            className="absolute bottom-3 right-3 p-2 bg-amber-500 rounded-lg text-black opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full min-h-[500px] border-2 border-dashed border-stone-800 rounded-2xl flex flex-col items-center justify-center text-stone-700 bg-stone-900/20">
                       <Clapperboard size={64} className="mb-6 opacity-20" />
                       <p className="font-mono text-xs uppercase tracking-widest">No Sequence Data</p>
                    </div>
                  )}
                </div>
             </div>

             {/* Full Screen Video Preview Modal */}
             {isPreviewingVideo && storyFrames.length > 0 && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    <button 
                        onClick={() => setIsPreviewingVideo(false)} 
                        className="absolute top-6 right-6 p-3 bg-stone-900 rounded-full text-white hover:bg-stone-800 z-50"
                    >
                        <X size={24} />
                    </button>
                    <div className={`max-w-5xl w-full ${getGridAspectClass(storyAspectRatio)} relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl`}>
                        <img 
                            src={storyFrames[currentVideoFrame]} 
                            className="w-full h-full object-contain bg-black animate-in fade-in duration-300" 
                        />
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2">
                             {storyFrames.map((_, idx) => (
                                 <div 
                                    key={idx} 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentVideoFrame ? 'w-8 bg-amber-500' : 'w-2 bg-white/20'}`} 
                                 />
                             ))}
                        </div>
                        <div className="absolute top-6 left-6 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-white font-mono text-xs border border-white/10">
                            FRAME {currentVideoFrame + 1}/{storyFrames.length}
                        </div>
                    </div>
                </div>
             )}
          </div>
        )}

        {/* VIEW: UTILITY LAB */}
        {view === AppView.UTILITY && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <header className="border-b border-white/5 pb-6">
                    <h2 className="text-3xl lg:text-4xl font-thin text-white tracking-wide">Utility <span className="font-bold text-amber-500">Lab</span></h2>
                    <p className="text-stone-400 mt-2 text-sm lg:text-lg">Advanced post-processing and modification engine.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Tool Sidebar */}
                    <div className="w-full lg:w-64 flex flex-col gap-2">
                        <button onClick={() => setUtilityTool('ASPECT')} className={`p-4 rounded-xl text-left border transition-all ${utilityTool === 'ASPECT' ? 'bg-stone-800 border-amber-500 text-white shadow-lg' : 'bg-stone-900/50 border-stone-800 text-stone-500 hover:bg-stone-800'}`}>
                            <Scaling className="mb-2" size={24} />
                            <p className="font-bold text-sm">Smart Resizer</p>
                            <p className="text-[10px] opacity-60">Aspect Ratio Shift</p>
                        </button>
                        <button onClick={() => setUtilityTool('FACESWAP')} className={`p-4 rounded-xl text-left border transition-all ${utilityTool === 'FACESWAP' ? 'bg-stone-800 border-amber-500 text-white shadow-lg' : 'bg-stone-900/50 border-stone-800 text-stone-500 hover:bg-stone-800'}`}>
                            <ScanFace className="mb-2" size={24} />
                            <p className="font-bold text-sm">Face Fusion</p>
                            <p className="text-[10px] opacity-60">Identity Swap</p>
                        </button>
                        <button onClick={() => setUtilityTool('UPSCALE')} className={`p-4 rounded-xl text-left border transition-all ${utilityTool === 'UPSCALE' ? 'bg-stone-800 border-amber-500 text-white shadow-lg' : 'bg-stone-900/50 border-stone-800 text-stone-500 hover:bg-stone-800'}`}>
                            <Sparkles className="mb-2" size={24} />
                            <p className="font-bold text-sm">Clarity Engine</p>
                            <p className="text-[10px] opacity-60">4K Upscaling</p>
                        </button>
                    </div>

                    {/* Work Area */}
                    <GlassPanel className="flex-1 p-8 min-h-[500px] flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                            {/* Inputs */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Base Source</label>
                                    <DragDropZone 
                                        multiple={false}
                                        onFilesSelected={(f) => setUtilBaseImage(f[0])}
                                        label={utilBaseImage ? "Source Loaded" : "Upload Source Image"}
                                        icon={ImageIcon}
                                    />
                                </div>

                                {utilityTool === 'ASPECT' && (
                                    <div className="space-y-4 animate-in fade-in">
                                        <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-200 text-xs">
                                            <p className="font-bold mb-1">AI Aspect Extension</p>
                                            <p>The AI will outpaint/expand the background to fit the new ratio without stretching the subject.</p>
                                        </div>
                                        <AspectRatioSelector value={utilAspectRatio} onChange={setUtilAspectRatio} />
                                    </div>
                                )}

                                {utilityTool === 'FACESWAP' && (
                                    <div className="space-y-2 animate-in fade-in">
                                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Target Face</label>
                                        <DragDropZone 
                                            multiple={false}
                                            onFilesSelected={(f) => setUtilSecondaryImage(f[0])}
                                            label={utilSecondaryImage ? "Face Loaded" : "Upload Face Source"}
                                            icon={ScanFace}
                                            compact
                                        />
                                    </div>
                                )}

                                <div className="pt-6">
                                    <Button3D fullWidth onClick={handleUtilityAction} disabled={loading || !utilBaseImage || (utilityTool === 'FACESWAP' && !utilSecondaryImage)}>
                                        {loading ? 'Processing...' : 'Run Operation'}
                                    </Button3D>
                                </div>
                            </div>

                            {/* Result */}
                            <div className="bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[size:24px_24px]" />
                                {utilResult ? (
                                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                                        <img src={utilResult} className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10" />
                                        <button onClick={() => downloadImage(utilResult)} className="absolute bottom-6 right-6 p-3 bg-amber-500 text-black rounded-xl shadow-lg hover:scale-110 transition-transform">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center text-stone-600 relative z-10">
                                        <Wand2 size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-xs uppercase tracking-widest font-bold">Output Pending</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        )}

        {/* VIEW: HISTORY (Archives) */}
        {view === AppView.HISTORY && (
            <div className="max-w-7xl mx-auto animate-in fade-in">
                <h2 className="text-4xl font-thin text-white tracking-wide mb-10">Data <span className="font-bold text-stone-500">Archives</span></h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {history.map(item => (
                        <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/10 bg-stone-900">
                            {item.type === 'story' ? (
                                <div className="w-full h-full bg-stone-950 grid grid-cols-2 gap-px">
                                    {(item.content as string[]).slice(0,4).map((src, i) => <img key={i} src={src} className="w-full h-full object-cover opacity-80" />)}
                                </div>
                            ) : (
                                <img src={item.content as string} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                            )}
                            <div className="absolute inset-0 bg-stone-950/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                                <button onClick={() => downloadImage(item.type === 'story' ? (item.content as string[])[0] : item.content as string)} className="p-3 bg-white/10 rounded-xl hover:bg-amber-500 hover:text-black text-white transition-colors"><Download size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* Placeholder Views */}
        {view === AppView.CODE && (
            <div className="flex items-center justify-center h-[70vh] text-stone-600 animate-in fade-in">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-6">
                        <Code2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-300 mb-2 uppercase tracking-widest">Module Offline</h2>
                    <p className="text-xs font-mono">System update pending...</p>
                </div>
            </div>
        )}

      </main>

       {/* Mobile Bottom Navigation */}
       <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-stone-950/90 backdrop-blur-xl border-t border-white/10 z-30 flex items-center justify-around px-4">
            <button onClick={() => setView(AppView.IDENTITY)} className={`flex flex-col items-center gap-1 ${view === AppView.IDENTITY ? 'text-amber-500' : 'text-stone-500'}`}>
                <Users size={24} />
                <span className="text-[10px] font-bold">Identity</span>
            </button>
            <button onClick={() => setView(AppView.CANVAS)} className={`flex flex-col items-center gap-1 ${view === AppView.CANVAS ? 'text-amber-500' : 'text-stone-500'}`}>
                <Palette size={24} />
                <span className="text-[10px] font-bold">Canvas</span>
            </button>
             <button onClick={() => setView(AppView.STORY)} className={`flex flex-col items-center gap-1 ${view === AppView.STORY ? 'text-amber-500' : 'text-stone-500'}`}>
                <Film size={24} />
                <span className="text-[10px] font-bold">Studio</span>
            </button>
            <button onClick={() => setView(AppView.UTILITY)} className={`flex flex-col items-center gap-1 ${view === AppView.UTILITY ? 'text-amber-500' : 'text-stone-500'}`}>
                <Wand2 size={24} />
                <span className="text-[10px] font-bold">Tools</span>
            </button>
       </div>
    </div>
  );
};

export default App;