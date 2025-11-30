import React, { useState, useEffect } from 'react';
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
  Fingerprint
} from 'lucide-react';
import { AppState, AppView, Character, GenerationItem } from './types';
import { trainCharacterIdentity, generateCreativeImage, editImageUtility, generateComponentCode } from './services/geminiService';

// --- UI Primitives (3D Design System) ---

// A tactile 3D button that presses down when clicked
const Button3D: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
  const baseStyles = "relative font-bold py-3 px-6 rounded-xl transition-all duration-100 active:translate-y-1 active:border-b-0 focus:outline-none flex items-center justify-center gap-2";
  const disabledStyles = "opacity-50 cursor-not-allowed border-b-0 translate-y-1";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-b-4 border-indigo-900 shadow-lg shadow-indigo-500/20 hover:brightness-110",
    secondary: "bg-slate-800 text-slate-200 border-b-4 border-slate-950 hover:bg-slate-750",
    danger: "bg-red-600 text-white border-b-4 border-red-900 hover:bg-red-500",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border-b-0 py-2" // Flat for ghost
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? disabledStyles : variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// A panel that looks like glass floating in space
const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
);

// An input field that looks carved into the surface
const RecessedInput: React.FC<any> = ({ className, ...props }) => (
  <input 
    className={`bg-slate-950/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-slate-800/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-slate-600 ${className}`}
    {...props}
  />
);

const RecessedTextArea: React.FC<any> = ({ className, ...props }) => (
  <textarea 
    className={`bg-slate-950/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-slate-800/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-slate-600 resize-none ${className}`}
    {...props}
  />
);

// --- Security Gate Component ---
const SecurityGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlock = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    
    // Simulate verification delay for effect
    setTimeout(() => {
      if (code.toLowerCase() === 'umaismusk') {
        onUnlock();
      } else {
        setError(true);
        setLoading(false);
        setTimeout(() => setError(false), 500); // Reset shake
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4">
      <div className={`relative max-w-md w-full transition-transform duration-100 ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* Decorative Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <GlassPanel className="p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Scan Line Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_0%,#4f46e5_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_4s_linear_infinite]"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner border border-slate-700">
               {loading ? (
                 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <Lock className="text-indigo-400 w-10 h-10" />
               )}
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">System Locked</h1>
            <p className="text-slate-400 text-sm">Restricted Access. Identity Verification Required.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} /> Security Code
              </label>
              <RecessedInput 
                type="password"
                placeholder="Enter Passcode..."
                value={code}
                onChange={(e: any) => { setCode(e.target.value); setError(false); }}
                className={`w-full text-center text-lg tracking-[0.5em] font-mono ${error ? 'border-red-500/50 focus:ring-red-500/50 text-red-400' : ''}`}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-xs font-bold text-center mt-2 animate-pulse">ACCESS DENIED: INVALID CREDENTIALS</p>
              )}
            </div>

            <Button3D fullWidth onClick={() => handleUnlock()} disabled={!code || loading} className="py-4 text-lg">
              {loading ? 'Verifying...' : 'Unlock Terminal'}
            </Button3D>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-600 font-mono">SECURE CONNECTION ESTABLISHED • HORIZON LABS V2.5</p>
          </div>
        </GlassPanel>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};


// --- Header ---
const Header: React.FC = () => (
  <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-50 bg-slate-950/10 backdrop-blur-sm">
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transform rotate-3">
            <Sparkles className="text-white" size={24} />
        </div>
        <div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                Horizon <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Lab</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase opacity-70">
                Created by Shaikh Aliakbar
            </p>
        </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5 shadow-inner backdrop-blur-md">
        <Zap size={14} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
        <span className="text-xs font-bold text-slate-200">950 <span className="text-slate-500 font-normal">Credits</span></span>
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-800 shadow-xl flex items-center justify-center">
         <Fingerprint className="text-white/50" size={20} />
      </div>
    </div>
  </header>
);

// --- Sidebar ---
const Sidebar: React.FC<{ current: AppView; onChange: (v: AppView) => void }> = ({ current, onChange }) => {
  const items = [
    { id: AppView.CANVAS, icon: Palette, label: 'Canvas' },
    { id: AppView.IDENTITY, icon: Users, label: 'Identity' },
    { id: AppView.UTILITY, icon: Wand2, label: 'Utility' },
    { id: AppView.CODE, icon: Code2, label: 'Code' },
    { id: AppView.HISTORY, icon: History, label: 'History' },
  ];

  return (
    <aside className="w-20 lg:w-24 flex flex-col pt-4 hidden md:flex h-[calc(100vh-80px)] fixed left-0 top-20 z-40 items-center gap-6 px-2">
      <nav className="flex-1 space-y-4">
        {items.map((item) => {
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`relative group w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-600/30 -translate-y-1' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
                {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-indigo-400 opacity-20 blur-md"></div>
                )}
              <item.icon size={24} className={`relative z-10 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[9px] font-semibold relative z-10">{item.label}</span>
              
              {/* Active Indicator Dot */}
              {isActive && <div className="absolute -right-1 w-2 h-2 bg-white rounded-full"></div>}
            </button>
          )
        })}
      </nav>
      <div className="mb-6 flex flex-col items-center">
         <div className="w-10 h-1 bg-slate-800 rounded-full mb-2"></div>
         <p className="text-[10px] text-slate-600 font-mono rotate-180 writing-mode-vertical">V 2.5</p>
      </div>
    </aside>
  );
};

// --- Mobile Nav ---
const MobileNav: React.FC<{ current: AppView; onChange: (v: AppView) => void }> = ({ current, onChange }) => {
    const items = [
        { id: AppView.CANVAS, icon: Palette },
        { id: AppView.IDENTITY, icon: Users },
        { id: AppView.UTILITY, icon: Wand2 },
        { id: AppView.CODE, icon: Code2 },
        { id: AppView.HISTORY, icon: History },
      ];
      return (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-4 flex justify-between z-50 rounded-2xl shadow-2xl">
            {items.map((item) => (
                 <button
                 key={item.id}
                 onClick={() => onChange(item.id)}
                 className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                   current === item.id
                     ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 -translate-y-2'
                     : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 <item.icon size={22} />
               </button>
            ))}
        </nav>
      )
}

// --- Identity Studio Component ---
const IdentityStudio: React.FC<{
  characters: Character[];
  onTrain: (name: string, images: string[]) => Promise<void>;
}> = ({ characters, onTrain }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles: File[] = Array.from(e.target.files);
      const count = selectedFiles.length;
      const newFiles: string[] = [];

      selectedFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            newFiles.push(reader.result);
            if (newFiles.length === count) {
              setFiles((prev) => [...prev, ...newFiles]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const startTraining = async () => {
    if (!name || files.length === 0) return;
    setLoading(true);
    await onTrain(name, files);
    setLoading(false);
    setStep(1);
    setName('');
    setFiles([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Identity Studio</h2>
        <p className="text-indigo-200/60 text-lg">Train consistent character models using Nano Banana LoRA simulation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Training Wizard */}
        <GlassPanel className="lg:col-span-2 p-8 relative overflow-hidden group">
            {/* Ambient Background Effect */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all duration-1000"></div>

            {loading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white font-bold mt-6 text-xl animate-pulse">Training Neural Network...</p>
                </div>
            )}
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 ${step >= s ? 'bg-indigo-500 text-white shadow-indigo-500/40 scale-110' : 'bg-slate-800 text-slate-500'}`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`h-1 flex-1 mx-4 rounded-full ${step > s ? 'bg-indigo-500/50' : 'bg-slate-800'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <div className="text-center py-12 px-6 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 group/upload">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover/upload:scale-110 transition-transform duration-300">
                        <Users className="w-10 h-10 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">Upload Reference Images</p>
                    <p className="text-slate-400 mb-8">Select 3-5 high quality face close-ups.</p>
                    
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-1">
                        Select from Device
                    </label>

                    {files.length > 0 && (
                         <div className="mt-8 flex gap-3 justify-center flex-wrap">
                            {files.map((f, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 transform hover:scale-110 transition-transform">
                                    <img src={f} className="w-full h-full object-cover" alt="ref" />
                                </div>
                            ))}
                         </div>
                    )}
                     <div className="mt-10 flex justify-end">
                         <Button3D onClick={() => setStep(2)} disabled={files.length === 0}>Next Step <ChevronRight size={18} /></Button3D>
                     </div>
                </div>
            )}

            {step === 2 && (
                <div className="py-8">
                    <label className="block text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">Character Name</label>
                    <RecessedInput 
                        type="text" 
                        value={name}
                        onChange={(e: any) => setName(e.target.value)}
                        placeholder="e.g. Cyberpunk Samurai"
                        className="text-xl"
                    />
                    <div className="mt-12 flex justify-between">
                        <Button3D variant="secondary" onClick={() => setStep(1)}>Back</Button3D>
                        <Button3D onClick={() => setStep(3)} disabled={!name}>Next Step</Button3D>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 shadow-2xl shadow-indigo-500/30 flex items-center justify-center animate-bounce">
                        <Sparkles className="text-white w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">Ready to Initialize</h3>
                    <p className="text-slate-400 mb-10 max-w-md mx-auto">We will analyze your images to create a persistent identity token suitable for the Nano Banana model.</p>
                    <Button3D onClick={startTraining} fullWidth>
                        Start Training Procedure
                    </Button3D>
                </div>
            )}
        </GlassPanel>

        {/* Gallery */}
        <GlassPanel className="p-6 h-fit">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Layers className="text-indigo-400" />
                Trained Models
            </h3>
            <div className="space-y-4">
                {characters.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Users size={48} className="mx-auto mb-2" />
                        <p className="text-sm">No models yet.</p>
                    </div>
                )}
                {characters.map(char => (
                    <div key={char.id} className="group flex items-center gap-4 p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:bg-indigo-900/20 transition-all hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                        <img src={char.thumbnail} alt={char.name} className="w-14 h-14 rounded-lg object-cover shadow-md" />
                        <div>
                            <p className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">{char.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">ID: {char.id.slice(0,8)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </GlassPanel>
      </div>
    </div>
  );
};

// --- Generation Canvas Component ---
const GenerationCanvas: React.FC<{
  characters: Character[];
  onGenerate: (data: GenerationItem) => void;
}> = ({ characters, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [negPrompt, setNegPrompt] = useState('');
  const [selectedChar, setSelectedChar] = useState<string>('');
  const [aspect, setAspect] = useState<any>('1:1');
  const [style, setStyle] = useState('Cinematic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const char = characters.find(c => c.id === selectedChar);
      const imgData = await generateCreativeImage(prompt, aspect, negPrompt, char?.description, style);
      setResult(imgData);
      onGenerate({
        id: crypto.randomUUID(),
        type: 'image',
        content: imgData,
        prompt,
        timestamp: Date.now(),
        metadata: { model: 'gemini-2.5-flash-image', style, characterId: selectedChar }
      });
    } catch (e) {
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const styles = ['Cinematic', 'Anime', 'Photographic', '3D Render', 'Watercolor', 'Cyberpunk'];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] mt-4 lg:mt-0 gap-6 p-4 lg:p-6 max-w-[1920px] mx-auto">
      {/* Controls - Floating Panel */}
      <GlassPanel className="w-full lg:w-[420px] p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar h-full">
           <div>
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users size={14} /> Identity Model
            </label>
            <div className="relative">
                <select 
                    value={selectedChar} 
                    onChange={(e) => setSelectedChar(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-inner"
                >
                    <option value="">No Character (Pure Prompt)</option>
                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
           </div>

           <div>
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={14} /> Positive Prompt
            </label>
            <RecessedTextArea 
                value={prompt}
                onChange={(e: any) => setPrompt(e.target.value)}
                rows={5}
                placeholder="Describe your imagination in vivid detail..."
            />
           </div>

           <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Negative Prompt</label>
            <RecessedInput 
                type="text"
                value={negPrompt}
                onChange={(e: any) => setNegPrompt(e.target.value)}
                placeholder="blur, low quality, distorted..."
            />
           </div>

           <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Style Preset</label>
            <div className="grid grid-cols-3 gap-3">
                {styles.map(s => (
                    <button 
                        key={s} 
                        onClick={() => setStyle(s)}
                        className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                            style === s 
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
           </div>

           <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Aspect Ratio</label>
            <div className="flex gap-3 bg-slate-950/30 p-1 rounded-xl border border-slate-800/50">
                {['1:1', '16:9', '9:16'].map(r => (
                     <button 
                     key={r} 
                     onClick={() => setAspect(r)}
                     className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        aspect === r 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                     }`}
                 >
                     {r}
                 </button>
                ))}
            </div>
           </div>

           <div className="mt-auto pt-4">
                <Button3D 
                    disabled={isGenerating || !prompt}
                    onClick={handleGenerate}
                    fullWidth
                    className="text-lg"
                >
                    {isGenerating ? <div className="animate-spin mr-2">⟳</div> : <Wand2 className="mr-2" />}
                    {isGenerating ? 'Dreaming...' : 'Generate Art'}
                </Button3D>
           </div>
      </GlassPanel>

      {/* Preview Area - 3D Stage */}
      <div className="flex-1 bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            {!result && !isGenerating && (
                <div className="text-center opacity-40 animate-pulse">
                    <div className="w-32 h-32 border-4 border-dashed border-slate-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                        <Palette size={48} className="text-slate-600" />
                    </div>
                    <p className="text-xl font-light tracking-wide">Ready to visualize</p>
                </div>
            )}
            
            {isGenerating && (
                <div className="text-center z-10">
                    <div className="relative w-32 h-32 mx-auto mb-8">
                        <div className="absolute inset-0 border-8 border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="text-indigo-400 animate-ping" size={32} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse">
                        DIFFUSING REALITY...
                    </p>
                </div>
            )}

            {result && !isGenerating && (
                <div className="relative group max-w-full max-h-full p-8 animate-in zoom-in duration-500">
                    <div className="relative rounded-lg shadow-2xl shadow-black/50 overflow-hidden transform transition-transform duration-500 hover:scale-[1.02] border-4 border-slate-900">
                        <img src={result} alt="Generated" className="max-w-full max-h-[75vh] object-contain" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8">
                            <a href={result} download="horizon_gen.png" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 hover:scale-105 transition-all flex items-center gap-2">
                                <Download size={20} /> Download HD Asset
                            </a>
                        </div>
                    </div>
                </div>
            )}
      </div>
    </div>
  );
};

// --- Utility Lab Component ---
const UtilityLab: React.FC = () => {
  const [mode, setMode] = useState<'FACESWAP' | 'UPSCALE' | 'BACKGROUND'>('FACESWAP');
  const [srcImg, setSrcImg] = useState<string>('');
  const [targetImg, setTargetImg] = useState<string>(''); // For face swap
  const [bgPrompt, setBgPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => setter(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const process = async () => {
    if (!srcImg) return;
    setLoading(true);
    try {
        const res = await editImageUtility(srcImg, mode, { secondaryImage: targetImg, prompt: bgPrompt });
        setOutput(res);
    } catch (e) {
        alert("Operation failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
        <h2 className="text-4xl font-black text-white mb-8 drop-shadow-lg">Utility Lab</h2>
        
        {/* 3D Tabs */}
        <div className="flex gap-4 mb-8 bg-slate-900/50 p-2 rounded-2xl w-fit border border-white/5 backdrop-blur-md">
            {[
                {id: 'FACESWAP', label: 'Face Swap'},
                {id: 'UPSCALE', label: 'AI Upscaler'},
                {id: 'BACKGROUND', label: 'Background Editor'}
            ].map(m => (
                <button 
                    key={m.id}
                    onClick={() => { setMode(m.id as any); setOutput(''); }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        mode === m.id 
                        ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    {m.label}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
                <GlassPanel className="p-6">
                    <p className="text-sm font-bold text-indigo-300 uppercase mb-4">Source Image</p>
                    {srcImg ? (
                        <div className="relative group">
                            <img src={srcImg} className="h-64 w-full object-cover rounded-xl shadow-inner border border-slate-700" alt="src"/>
                            <button onClick={() => setSrcImg('')} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="h-64 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-950/30 hover:bg-slate-900/50 transition-colors group cursor-pointer relative">
                             <input type="file" onChange={(e) => handleFile(e, setSrcImg)} className="absolute inset-0 opacity-0 cursor-pointer" />
                             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                <Wand2 className="text-indigo-400" />
                             </div>
                             <span className="text-slate-400 font-medium">Upload Source Image</span>
                        </div>
                    )}
                </GlassPanel>

                {mode === 'FACESWAP' && (
                     <GlassPanel className="p-6">
                        <p className="text-sm font-bold text-indigo-300 uppercase mb-4">Target Face</p>
                        {targetImg ? (
                            <div className="relative group">
                                <img src={targetImg} className="h-48 w-full object-cover rounded-xl shadow-inner border border-slate-700" alt="target"/>
                                <button onClick={() => setTargetImg('')} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"><Trash2 size={16} /></button>
                            </div>
                        ) : (
                            <div className="h-32 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-950/30 relative group">
                                <input type="file" onChange={(e) => handleFile(e, setTargetImg)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <span className="text-slate-500 group-hover:text-indigo-300 transition-colors">Upload Target Face</span>
                            </div>
                        )}
                    </GlassPanel>
                )}

                {mode === 'BACKGROUND' && (
                     <GlassPanel className="p-6">
                         <p className="text-sm font-bold text-indigo-300 uppercase mb-4">New Background Prompt</p>
                         <RecessedInput 
                            type="text" 
                            value={bgPrompt}
                            onChange={(e: any) => setBgPrompt(e.target.value)}
                            placeholder="A futuristic city with neon lights..."
                         />
                     </GlassPanel>
                )}

                <Button3D 
                    onClick={process}
                    disabled={loading || !srcImg}
                    fullWidth
                    className="py-4 text-lg"
                >
                    {loading ? 'Processing Magic...' : 'Run Operation'}
                </Button3D>
            </div>

            {/* Output Section */}
            <GlassPanel className="flex items-center justify-center p-6 min-h-[400px] border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
                {output ? (
                    <div className="relative group animate-in zoom-in duration-500">
                        <img src={output} className="max-w-full max-h-[600px] rounded-xl shadow-2xl border border-white/10" alt="result" />
                        <div className="absolute top-4 right-4">
                            <a href={output} download className="bg-black/50 backdrop-blur text-white p-2 rounded-lg hover:bg-black/70 transition-colors block">
                                <Download size={20} />
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-center opacity-30">
                        <Layers size={64} className="mx-auto mb-4 text-slate-500" />
                        <p className="text-slate-400 font-medium">Result will materialize here</p>
                    </div>
                )}
            </GlassPanel>
        </div>
    </div>
  );
};

// --- Code Studio ---
const CodeStudio: React.FC<{ onSave: (code: string, prompt: string) => void }> = ({ onSave }) => {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGen = async () => {
        setLoading(true);
        const res = await generateComponentCode(prompt);
        // Clean markdown
        const clean = res.replace(/```(tsx|jsx|javascript|typescript)?/g, '').replace(/```/g, '');
        setCode(clean);
        setLoading(false);
        onSave(clean, prompt);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-6 p-6">
            <GlassPanel className="w-full lg:w-1/3 p-8 flex flex-col h-full">
                <div className="mb-6">
                    <div className="inline-block p-3 bg-yellow-500/20 rounded-xl mb-4">
                        <Code2 className="text-yellow-400" size={32} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">Autocoding 🍌</h3>
                    <p className="text-slate-400">Describe a UI component and our LLM engine will construct it.</p>
                </div>
                
                <RecessedTextArea 
                    value={prompt}
                    onChange={(e: any) => setPrompt(e.target.value)}
                    className="flex-1 mb-6 font-mono text-sm"
                    placeholder="Create a pricing card component with 3 tiers, dark mode, using Tailwind CSS..."
                />
                
                <Button3D onClick={handleGen} disabled={loading || !prompt} fullWidth>
                    {loading ? 'Compiling...' : 'Generate Component'}
                </Button3D>
            </GlassPanel>

            <div className="w-full lg:w-2/3 bg-[#1e1e1e] rounded-2xl p-6 overflow-auto shadow-2xl border border-slate-800 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => navigator.clipboard.writeText(code)} className="bg-slate-700 text-white px-3 py-1 rounded text-xs hover:bg-slate-600">Copy</button>
                </div>
                {code ? (
                    <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{code}</pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono opacity-50">
                        <div className="w-16 h-16 border-2 border-dashed border-slate-600 rounded-lg mb-4 flex items-center justify-center">
                            <span className="text-2xl">{'</>'}</span>
                        </div>
                        // Code output waiting for input...
                    </div>
                )}
            </div>
        </div>
    );
}

// --- History Gallery ---
const HistoryGallery: React.FC<{ history: GenerationItem[] }> = ({ history }) => (
    <div className="p-8 max-w-[1920px] mx-auto">
        <h2 className="text-4xl font-black text-white mb-8 drop-shadow-md">Time Capsule</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {history.map(item => (
                <div key={item.id} className="group relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-white/5 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-2">
                    {item.type === 'image' ? (
                        <img src={item.content} alt="history" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full p-4 flex items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors">
                            <Code2 className="text-slate-500 group-hover:text-indigo-400 transition-colors" size={48} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                        <p className="text-xs font-bold text-white line-clamp-2 mb-1 drop-shadow-md">{item.prompt}</p>
                        <p className="text-[10px] text-slate-300 font-mono">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
            {history.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-30">
                    <History size={64} className="mx-auto mb-4" />
                    <p className="text-xl">Timeline is empty.</p>
                </div>
            )}
        </div>
    </div>
);


/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

const App: React.FC = () => {
  const [locked, setLocked] = useState(true);
  const [view, setView] = useState<AppView>(AppView.CANVAS);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [history, setHistory] = useState<GenerationItem[]>([]);

  // Handlers
  const handleTrainCharacter = async (name: string, images: string[]) => {
    try {
        const newChar = await trainCharacterIdentity(name, images);
        setCharacters(prev => [...prev, newChar]);
        setView(AppView.CANVAS); 
    } catch (e) {
        console.error(e);
        alert("Failed to train character.");
    }
  };

  const handleNewGeneration = (item: GenerationItem) => {
      setHistory(prev => [item, ...prev]);
  };

  if (locked) {
    return <SecurityGate onUnlock={() => setLocked(false)} />;
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden animate-in fade-in duration-700">
      <Header />
      <div className="flex pt-4 md:pt-0">
        <Sidebar current={view} onChange={setView} />
        <main className="flex-1 md:ml-24 lg:ml-24 relative min-h-[calc(100vh-80px)] pb-24 md:pb-0 transition-all duration-500">
          {view === AppView.CANVAS && (
             <GenerationCanvas characters={characters} onGenerate={handleNewGeneration} />
          )}
          {view === AppView.IDENTITY && (
            <IdentityStudio characters={characters} onTrain={handleTrainCharacter} />
          )}
          {view === AppView.UTILITY && (
            <UtilityLab />
          )}
          {view === AppView.CODE && (
            <CodeStudio onSave={(code, prompt) => handleNewGeneration({
                id: crypto.randomUUID(), type: 'code', content: code, prompt, timestamp: Date.now()
            })} />
          )}
          {view === AppView.HISTORY && (
            <HistoryGallery history={history} />
          )}
        </main>
      </div>
      <MobileNav current={view} onChange={setView} />
    </div>
  );
};

export default App;