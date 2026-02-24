"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card, Title, Text, Badge, Flex } from '@tremor/react';
import { Maximize2, RefreshCw } from 'lucide-react';

interface Point {
    x: number;
    y: number;
    value: number;
    type: 'hot' | 'dead' | 'noise';
}

export default function SensorMappingViewer({ isAnalyzing, isDataLoaded }: { isAnalyzing: boolean; isDataLoaded?: boolean }) {
    const [points, setPoints] = useState<Point[]>([]);
    const [scanLine, setScanLine] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Simulation effect
    useEffect(() => {
        if (!isAnalyzing && scanLine === 0) {
            return;
        }
        if (!isAnalyzing) {
            return;
        }

        const interval = setInterval(() => {
            setScanLine(prev => {
                if (prev >= 100) return 100;
                return prev + 1;
            });

            // Randomly add defects
            if (Math.random() > 0.5) {
                setPoints(prev => [...prev, {
                    x: Math.random() * 100,
                    y: scanLine, // appearing at current scan line
                    value: Math.random(),
                    type: Math.random() > 0.7 ? 'hot' : Math.random() > 0.5 ? 'dead' : 'noise'
                } as Point]);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isAnalyzing, scanLine]);

    // Canvas drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        // ... simple grid drawing if needed

        // Draw points
        points.forEach(p => {
            const x = (p.x / 100) * canvas.width;
            const y = (p.y / 100) * canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            if (p.type === 'hot') ctx.fillStyle = '#ef4444'; // red
            else if (p.type === 'dead') ctx.fillStyle = '#171717'; // very dark gray for dead pixels
            else ctx.fillStyle = '#f59e0b'; // amber

            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        });

        // Draw scan line
        if (isAnalyzing && scanLine < 100) {
            const y = (scanLine / 100) * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.strokeStyle = '#10b981'; // emerald scanline
            ctx.lineWidth = 2;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#10b981';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

    }, [points, scanLine, isAnalyzing]);

    return (
        <Card className="bg-[#050505] border-[#1f2937] shadow-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all h-[400px] flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <Flex className="relative z-10">
                <div>
                    <Title className="text-white flex items-center gap-2">
                        <Maximize2 size={18} className="text-emerald-500 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all" />
                        Sensor Array Topography
                    </Title>
                    <Text className="text-slate-400">Real-time defect triangulation blueprint</Text>
                </div>
                {isAnalyzing && (
                    <Badge color="emerald" icon={RefreshCw} className="animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                        SCANNING {Math.min(scanLine, 100)}%
                    </Badge>
                )}
            </Flex>

            <div className="mt-6 flex-1 relative bg-black rounded-xl border border-[#1f2937] shadow-inner overflow-hidden flex items-center justify-center">
                {!isAnalyzing && !isDataLoaded && points.length === 0 && scanLine === 0 ? (
                    <div className="text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 mb-4 shadow-inner">
                            <Maximize2 className="text-slate-600" />
                        </div>
                        <p className="text-slate-500 text-sm">Waiting for data stream...</p>
                        <p className="text-slate-600 text-xs mt-1">Upload sensor log to initiate mapping</p>
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={300}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Hot Pixel</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>FPN Noise</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-black border border-slate-700" />
                    <span>Dead Pixel</span>
                </div>
            </div>
        </Card>
    );
}
