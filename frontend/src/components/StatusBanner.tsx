import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { API_BASE } from '../lib/constants';

export type Status = 'queued' | 'started' | 'deferred' | 'finished' | 'failed';

interface StatusBannerProps {
    status: Status | null;
    progress?: number;
    progressText?: string;
    result?: any;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status, progress = 0, progressText, result }) => {
    if (!status) return null;

    const isFinished = status === 'finished';
    const isFailed = status === 'failed';
    const isPending = !isFinished && !isFailed;

    return (
        <div className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 min-w-[320px] max-w-md w-full glass p-4 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-500",
            isFinished && "border-primary/50",
            isFailed && "border-red-500/50"
        )}>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    {isPending && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                    {isFinished && <CheckCircle2 className="w-6 h-6 text-primary" />}
                    {isFailed && <AlertCircle className="w-6 h-6 text-red-500" />}
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-bold capitalize">
                        {status === 'finished' ? 'İndirmeye Hazır!' : status === 'failed' ? 'Hata Oluştu' : 'Video İşleniyor'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                        {isPending ? (progressText || `Hazırlanıyor... (%${progress})`) :
                            isFinished ? 'Tüm parçalar başarıyla oluşturuldu.' :
                                'Video işleme sırasında bir hata oluştu.'}
                    </p>
                </div>

                {isFinished && (
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                        onClick={() => {
                            const jobId = result.job_id || result.task_id;
                            window.location.href = `${API_BASE}/download/${jobId}`;
                        }}
                        aria-label="Tüm parçaları ZIP olarak indir"
                    >
                        <Download className="w-3.5 h-3.5" />
                        İndir
                    </button>
                )}
            </div>

            {isPending && (
                <div className="mt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 px-0.5">
                        <span>İlerleme</span>
                        <span>%{progress}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
