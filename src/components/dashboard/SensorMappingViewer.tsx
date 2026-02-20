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

export default function SensorMappingViewer({ isAnalyzing }: { isAnalyzing: boolean }) {
    const [points, setPoints] = useState<Point[]>([]);
    const [scanLine, setScanLine] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Simulation effect
    useEffect(() => {
        if (!isAnalyzing) {
            setPoints([]);
            setScanLine(0);
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
            else if (p.type === 'dead') ctx.fillStyle = '#000000'; // black
            else ctx.fillStyle = '#eab308'; // yellow/orange
            ctx.fill();
        });

        // Draw scan line
        if (isAnalyzing && scanLine < 100) {
            const y = (scanLine / 100) * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.strokeStyle = '#22c55e'; // green scanline
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#22c55e';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

    }, [points, scanLine, isAnalyzing]);

    return (
        <Card className="bg-[#0f0f0f] border-slate-800/50 h-[400px] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-800/[0.1] -z-10" />
            <Flex>
                <div>
                    <Title className="text-white flex items-center gap-2">
                        <Maximize2 size={18} className="text-blue-500" />
                        Sensor Mapping Viewer
                    </Title>
                    <Text className="text-slate-400">Real-time defect triangulation & noise heatmap</Text>
                </div>
                {isAnalyzing && (
                    <Badge color="green" icon={RefreshCw} className="animate-pulse">
                        SCANNING {Math.min(scanLine, 100)}%
                    </Badge>
                )}
            </Flex>

            <div className="mt-6 flex-1 relative bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden flex items-center justify-center">
                {!isAnalyzing && points.length === 0 ? (
                    <div className="text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 mb-4">
                            <Maximize2 className="text-slate-500" />
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
