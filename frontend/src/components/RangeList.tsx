import React from 'react';
import { Plus, Trash2, Clock, Scissors } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Range {
    id: string;
    start: string;
    end: string;
}

interface RangeListProps {
    ranges: Range[];
    onUpdate: (id: string, field: 'start' | 'end', value: string) => void;
    onRemove: (id: string) => void;
    onAdd: () => void;
    onProcess: () => void;
    isProcessing: boolean;
    activeInputId: string | null;
    setActiveInputId: (id: string | null) => void;
}

export const RangeList: React.FC<RangeListProps> = ({
    ranges, onUpdate, onRemove, onAdd, onProcess, isProcessing, activeInputId, setActiveInputId
}) => {
    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Parçalar</h3>
                <button
                    onClick={onAdd}
                    className="p-1 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                    title="Parça Ekle"
                    aria-label="Yeni parça ekle"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {ranges.map((range, index) => (
                    <div
                        key={range.id}
                        className={cn(
                            "p-3 rounded-xl border border-border/50 bg-secondary/30 transition-all group",
                            (activeInputId?.includes(range.id)) && "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5"
                        )}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-muted-foreground">#{(index + 1).toString().padStart(2, '0')}</span>
                            <button
                                onClick={() => onRemove(range.id)}
                                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                title="Sil"
                                aria-label="Bu parçayı sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-primary/70" /> Başlangıç
                                </label>
                                <input
                                    type="text"
                                    value={range.start}
                                    placeholder="00:00"
                                    onFocus={() => setActiveInputId(`${range.id}-start`)}
                                    onChange={(e) => onUpdate(range.id, 'start', e.target.value)}
                                    className="bg-background border border-border/50 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all w-full placeholder:text-muted-foreground/30"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-primary/70" /> Bitiş
                                </label>
                                <input
                                    type="text"
                                    value={range.end}
                                    placeholder="00:00"
                                    onFocus={() => setActiveInputId(`${range.id}-end`)}
                                    onChange={(e) => onUpdate(range.id, 'end', e.target.value)}
                                    className="bg-background border border-border/50 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all w-full placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {ranges.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 border-2 border-dashed border-border rounded-xl">
                        <p className="text-xs">Henüz bir video parçası eklenmemiş.</p>
                    </div>
                )}
            </div>

            <button
                onClick={onProcess}
                disabled={isProcessing || ranges.length === 0}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                aria-label={isProcessing ? "İşlem devam ediyor" : "Videoları bölme işlemini başlat"}
            >
                <Scissors className={cn("w-5 h-5", isProcessing && "animate-pulse")} />
                {isProcessing ? 'İŞLENİYOR...' : 'VİDEOLARI BÖL'}
            </button>
        </div>
    );
};
