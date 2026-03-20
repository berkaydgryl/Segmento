import React, { useRef, useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, MapPin } from 'lucide-react';
import { formatTime } from '../lib/utils';
import * as Slider from '@radix-ui/react-slider';

interface VideoPlayerProps {
    src: string;
    onSetTimestamp: (time: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ src, onSetTimestamp }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const seek = (time: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time[0];
            setCurrentTime(time[0]);
        }
    };

    const handleCapture = () => {
        onSetTimestamp(formatTime(Math.floor(currentTime)));
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border shadow-2xl group">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {/* Play Overlay Button */}
                {!isPlaying && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                        onClick={togglePlay}
                        role="button"
                        aria-label="Videoyu Başlat"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 fill-current" />
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="glass p-4 rounded-xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground w-12">{formatTime(currentTime)}</span>
                    <Slider.Root
                        className="relative flex items-center select-none touch-none w-full h-5"
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={seek}
                        aria-label="Video zaman çizelgesi"
                    >
                        <Slider.Track className="bg-secondary relative grow rounded-full h-[6px]">
                            <Slider.Range className="absolute bg-primary rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 bg-primary shadow-lg rounded-full hover:scale-110 transition-transform focus:outline-none" aria-label="Kaydıraç" />
                    </Slider.Root>
                    <span className="text-xs font-mono text-muted-foreground w-12">{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => seek([Math.max(0, currentTime - 5)])}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground relative group"
                            title="5 saniye geri"
                            aria-label="5 saniye geri al"
                        >
                            <div className="relative">
                                <RotateCcw className="w-6 h-6" />
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5 ml-[-0.5px]">5</span>
                            </div>
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 flex items-center justify-center bg-primary/20 hover:bg-primary/30 text-primary rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/10"
                            aria-label={isPlaying ? "Durdur" : "Başlat"}
                        >
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                        </button>
                        <button
                            onClick={() => seek([Math.min(duration, currentTime + 5)])}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground relative group"
                            title="5 saniye ileri"
                            aria-label="5 saniye ileri sar"
                        >
                            <div className="relative">
                                <RotateCw className="w-6 h-6" />
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5 mr-[-0.5px]">5</span>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={handleCapture}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary/80 border border-border hover:bg-secondary rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        aria-label="Mevcut zamanı yakala"
                    >
                        <MapPin className="w-4 h-4 text-primary" />
                        Zamanı Yakala
                    </button>
                </div>
            </div>
        </div>
    );
});
