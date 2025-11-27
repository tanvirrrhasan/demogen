
import React, { useState, useCallback, useEffect } from 'react';
import { generateImagesBatch } from './services/gemini';
import { DemoCategory, GeneratedImage, ImageCount } from './types';
import { 
  DownloadIcon, SparklesIcon, ImageIcon, TrashIcon, LoaderIcon, 
  DiceIcon, SaveIcon, BookmarkIcon, XIcon
} from './components/Icons';

// Predefined prompts for the random generator
const CATEGORY_PROMPTS: Record<string, string[]> = {
  [DemoCategory.NONE]: [
    "A futuristic city skyline at sunset with flying cars",
    "A cozy reading nook with a velvet armchair and books",
    "A golden retriever puppy playing in a field of sunflowers",
    "Abstract geometric shapes floating in a blue void",
    "A delicious gourmet burger with melting cheese and fries"
  ],
  [DemoCategory.PRODUCT]: [
    "Minimalist sleek smartwatch on a dark textured background",
    "Organic branding skincare bottle with water droplets, podium shot",
    "High-end leather bag resting on a marble surface with warm lighting",
    "Modern ergonomic office chair isolated in a bright studio environment",
    "Gourmet coffee bean packaging with scattered beans and steam"
  ],
  [DemoCategory.STUDENT]: [
    "University student studying in a sunlit library with a laptop and coffee",
    "Diverse group of students collaborating on a science project in a lab",
    "Student with a backpack walking through a modern university campus",
    "Close-up of a student taking notes in a large lecture hall",
    "Graduation day portrait of a happy student holding a diploma outdoors"
  ],
  [DemoCategory.TEACHER]: [
    "Professional teacher writing complex equations on a whiteboard",
    "Kind elementary teacher reading a book to a circle of children",
    "University professor lecturing from a podium in a modern hall",
    "Science teacher demonstrating an experiment with colorful liquids",
    "Teacher having a one-on-one mentoring session with a student"
  ],
  [DemoCategory.STAFF]: [
    "Friendly receptionist smiling at a modern office front desk",
    "IT support specialist fixing a server rack with blue lighting",
    "Janitorial staff cleaning a shiny hallway in a commercial building",
    "HR manager interviewing a candidate in a glass-walled office",
    "Chef in a commercial kitchen preparing a gourmet meal"
  ],
  [DemoCategory.NATURE]: [
    "Serene mountain lake reflection at sunrise with mist",
    "Dense tropical rainforest with sunlight piercing through canopy",
    "Macro shot of a dew drop on a fresh green leaf",
    "Vibrant sunset over a calm ocean beach with silhouette palm trees",
    "Snow-covered pine forest during a quiet winter morning"
  ],
  [DemoCategory.TECH]: [
    "Futuristic artificial intelligence brain glowing with neural networks",
    "Cyberpunk city street at night with neon lights and rain",
    "Close up of a computer motherboard with blue LED lighting",
    "Virtual reality headset user interacting with digital interface",
    "Smart home interface displaying energy usage and controls"
  ],
  [DemoCategory.OFFICE]: [
    "Open plan modern office with people working at standing desks",
    "Executive boardroom with a view of the city skyline",
    "Co-working space with bean bags and casual meeting areas",
    "Clean minimalist desk setup with dual monitors and plants",
    "Busy office lobby with modern architecture and glass elevators"
  ],
  [DemoCategory.ABSTRACT]: [
    "Fluid colorful gradients mixing together in oil painting style",
    "Geometric 3D shapes floating in a zero gravity white space",
    "Digital data stream particles flowing in dark space",
    "Textured concrete wall with artistic shadow patterns",
    "Vibrant smoke explosion with neon colors on black background"
  ]
};

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [category, setCategory] = useState<string>(DemoCategory.NONE);
  const [count, setCount] = useState<ImageCount>(4);
  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Saved prompts state
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);
  
  // Load saved prompts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('demoGenSavedPrompts');
    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved prompts");
      }
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setShowSavedList(false);

    try {
      const base64Images = await generateImagesBatch(prompt, category, count);
      
      const newImages: GeneratedImage[] = base64Images.map(url => ({
        id: crypto.randomUUID(),
        url,
        prompt: category !== DemoCategory.NONE ? `${category}: ${prompt}` : prompt,
        timestamp: Date.now()
      }));

      setImages(prev => [...newImages, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback((imageUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `demo-image-${id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all images?")) {
      setImages([]);
    }
  };

  const handleRandom = (e: React.MouseEvent) => {
    e.preventDefault(); 
    const prompts = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS[DemoCategory.NONE];
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setPrompt(prompts[randomIndex]);
  };

  const handleSavePrompt = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!prompt.trim()) return;

    if (!savedPrompts.includes(prompt)) {
      const updated = [prompt, ...savedPrompts];
      setSavedPrompts(updated);
      localStorage.setItem('demoGenSavedPrompts', JSON.stringify(updated));
    }
  };

  const handleDeleteSavedPrompt = (e: React.MouseEvent, promptToDelete: string) => {
    e.stopPropagation();
    const updated = savedPrompts.filter(p => p !== promptToDelete);
    setSavedPrompts(updated);
    localStorage.setItem('demoGenSavedPrompts', JSON.stringify(updated));
  };

  const handleSelectSavedPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setShowSavedList(false);
  };
  
  const handleClearPrompt = () => {
    setPrompt('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DemoGen AI</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Professional Demo Assets Generator
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 relative z-10">
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Category Select */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-8"
                  >
                    {Object.values(DemoCategory).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Prompt Input Area */}
              <div className="md:col-span-7 relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Prompt
                  </label>
                  
                  {/* Toggle Saved List */}
                  {savedPrompts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSavedList(!showSavedList)}
                      className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <BookmarkIcon className="w-3 h-3" />
                      Saved ({savedPrompts.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 relative items-stretch">
                    
                    {/* Text Input */}
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A happy student holding a laptop in a library"
                        className="w-full h-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-10"
                      />
                      {prompt && (
                        <button
                          type="button"
                          onClick={handleClearPrompt}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Random / Save Button - Icon Only */}
                    {prompt.trim().length === 0 ? (
                      <button
                        type="button"
                        onClick={handleRandom}
                        className="flex-shrink-0 p-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors border border-purple-200"
                        title="Random Prompt"
                      >
                        <DiceIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSavePrompt}
                        className="flex-shrink-0 p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors border border-emerald-200"
                        title="Save Prompt"
                      >
                        <SaveIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Saved Prompts Dropdown */}
                  {showSavedList && savedPrompts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-20 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {savedPrompts.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group">
                            <button
                              type="button"
                              onClick={() => handleSelectSavedPrompt(p)}
                              className="text-left text-sm text-slate-700 flex-grow truncate mr-2"
                            >
                              {p}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedPrompt(e, p)}
                              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Count Select */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <div className="relative">
                  <select
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value) as ImageCount)}
                    className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-8"
                  >
                    {[2, 4, 8, 16].map((num) => (
                      <option key={num} value={num}>{num} images</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading || !prompt}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2
                ${loading || !prompt 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.99]'}`}
            >
              {loading ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  Generating Assets...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Create Demo Assets
                </>
              )}
            </button>
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Gallery Section */}
        {images.length > 0 && (
          <section>
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Generated Assets</h2>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
              >
                <TrashIcon className="w-4 h-4" />
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img) => (
                <div key={img.id} className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                       {/* You can add more actions here if needed */}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                       <p className="text-sm text-slate-600 line-clamp-2 flex-grow" title={img.prompt}>
                          {img.prompt}
                       </p>
                       <button 
                          onClick={() => handleDownload(img.url, img.id)}
                          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Download Image"
                        >
                          <DownloadIcon className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {new Date(img.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {images.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">No images generated yet</p>
            <p className="text-sm mt-1">Select a category and create some demo assets</p>
          </div>
        )}
      </main>
    </div>
  );
}
