import React, { useState, useCallback } from 'react';
import { Upload, Scissors, RefreshCw, Layers, X } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { RangeList } from './components/RangeList';
import type { Range } from './components/RangeList';
import { StatusBanner } from './components/StatusBanner';
import type { Status } from './components/StatusBanner';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [file, setFile] = useState<{ id: string; path: string; name: string } | null>(null);
  const [ranges, setRanges] = useState<Range[]>([
    { id: '1', start: '00:00:10', end: '00:00:20' }
  ]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Polling for job status
  const { data: jobStatus } = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: async () => {
      const resp = await axios.get(`${API_BASE}/status/${jobId}`);
      return resp.data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (data?.status === 'finished' || data?.status === 'failed') return false;
      return 2000;
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const resp = await axios.post(`${API_BASE}/upload`, formData);
      setFile({ id: resp.data.file_id, path: `${API_BASE}/video/${resp.data.file_id}`, name: uploadedFile.name });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Yükleme başarısız oldu.");
    }
  };

  const handleAddRange = useCallback(() => {
    setRanges(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), start: '', end: '' }
    ]);
  }, []);

  const handleUpdateRange = useCallback((id: string, field: 'start' | 'end', value: string) => {
    setRanges(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const handleRemoveRange = useCallback((id: string) => {
    setRanges(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const handleSetTimestamp = useCallback((time: string) => {
    if (!activeInputId) return;

    setRanges(prev => {
      const newRanges = prev.map(range => {
        if (range.id + '-start' === activeInputId) {
          return { ...range, start: time };
        }
        if (range.id + '-end' === activeInputId) {
          return { ...range, end: time };
        }
        return range;
      });

      // Auto-advance focus logic
      const [rangeId, type] = activeInputId.split('-');
      if (type === 'start') {
        setActiveInputId(rangeId + '-end');
      } else if (type === 'end') {
        const currentIndex = newRanges.findIndex(r => r.id === rangeId);
        if (currentIndex === newRanges.length - 1) {
          // Last range's end was set, add new range
          const newId = Math.random().toString(36).substr(2, 9);
          setActiveInputId(newId + '-start');
          return [
            ...newRanges,
            { id: newId, start: '', end: '' }
          ];
        }
      }
      return newRanges;
    });
  }, [activeInputId]);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    try {
      const resp = await axios.post(`${API_BASE}/split/${file.id}`, {
        ranges: ranges.map(({ start, end }) => ({ start, end }))
      });
      setJobId(resp.data.job_id);
    } catch (err: any) {
      console.error("Split request failed", err);
      const msg = err.response?.data?.detail || "Video bölme işlemi başlatılamadı.";
      alert(`Hata: ${msg}`);
      setJobId(null);
    }
  }, [file, ranges]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-[1600px] mx-auto gap-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Scissors className="text-primary-foreground w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">SEGMENTO<span className="text-primary">.</span></h1>
        </div>

        {file && (
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="hover:text-foreground transition-colors p-2"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
        {!file ? (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden bg-secondary/10">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary animate-pulse">
              <Upload className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">Videonu buraya sürükle veya tıkla</h2>
            <p className="text-muted-foreground text-sm max-w-xs text-center font-medium leading-relaxed">
              Uzun videoları saniyeler içinde parçalara ayırmak için MP4, MOV veya AVI dosyası yükle.
            </p>
          </div>
        ) : (
          <>
            {/* Left Col: Player */}
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-700">
              <VideoPlayer
                src={API_BASE + "/video/" + file.id}
                onSetTimestamp={handleSetTimestamp}
              />
              {showInstructions && (
                <div className="glass p-6 rounded-2xl flex flex-col gap-2 relative animate-in fade-in zoom-in duration-300">
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
                    title="Kapat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Nasıl Çalışır?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pr-8">
                    Videoyu oynatırken parçalamak istediğin saniyeye gel. "Zamanı Yakala" butonuna basarak başlangıç veya bitiş sürelerini otomatik doldur. İşlemi başlat ve sonucunu bekle.
                  </p>
                </div>
              )}
            </div>

            {/* Right Col: Controls */}
            <aside className="animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="glass h-full p-6 rounded-2xl flex flex-col">
                <RangeList
                  ranges={ranges}
                  onUpdate={handleUpdateRange}
                  onRemove={handleRemoveRange}
                  onAdd={handleAddRange}
                  onProcess={handleProcess}
                  isProcessing={!!jobId && jobStatus?.status !== 'finished' && jobStatus?.status !== 'failed'}
                  activeInputId={activeInputId}
                  setActiveInputId={setActiveInputId}
                />
              </div>
            </aside>
          </>
        )}
      </main>

      {/* Progress Overlay */}
      <StatusBanner
        status={jobId ? (jobStatus?.status as Status || 'queued') : null}
        progress={jobStatus?.progress}
        result={jobStatus}
      />
    </div>
  );
}

export default App;
