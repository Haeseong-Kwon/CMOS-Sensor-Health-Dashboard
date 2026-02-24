"use client";

import React, { useMemo } from 'react';
import { Card, Title, Text, Metric, Flex, Badge, ProgressBar } from '@tremor/react';
import { Clock, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { calculateHealthScore } from '@/lib/analytics';

interface MaintenanceCardProps {
    name: string;
    currentValue: number;
    threshold: number;
    rulDays: number; // Remaining Useful Life in days
}

export default function MaintenanceCard({ name, currentValue, threshold, rulDays }: MaintenanceCardProps) {
    const healthScore = useMemo(() => calculateHealthScore(currentValue, threshold), [currentValue, threshold]);

    const getStatusStyles = (score: number) => {
        if (score > 80) return { iconColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10', border: 'border-emerald-500/50', dropShadow: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]', badge: 'emerald', icon: ShieldCheck, text: 'Optimal' };
        if (score > 50) return { iconColor: 'text-amber-400', bgColor: 'bg-amber-500/10', border: 'border-amber-500/50', dropShadow: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]', badge: 'amber', icon: ShieldAlert, text: 'Degrading' };
        return { iconColor: 'text-red-500', bgColor: 'bg-red-500/10', border: 'border-red-500/60', dropShadow: 'drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]', badge: 'red', icon: ShieldX, text: 'Critical' };
    };

    const status = getStatusStyles(healthScore);

    return (
        <Card className={`bg-[#050505] border ${status.border} shadow-lg hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all duration-300 group`}>
            <Flex alignItems="start" justifyContent="between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all ${status.bgColor} ${status.iconColor} ${status.dropShadow} group-hover:scale-110`}>
                        <status.icon size={20} />
                    </div>
                    <div>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{name}</Text>
                        <Title className="text-white text-sm font-bold mt-0.5 tracking-tight">{status.text} Condition</Title>
                    </div>
                </div>
                <Badge color={status.badge as any} className="bg-opacity-10 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    Score: {healthScore}%
                </Badge>
            </Flex>

            <div className="mt-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
                <Flex>
                    <Text className="text-slate-500 text-xs font-medium">Remaining Useful Life (RUL)</Text>
                    <Text className={`${status.iconColor} text-xs font-bold`}>{rulDays} Days</Text>
                </Flex>
                <Metric className="text-white mt-1 text-4xl tracking-tighter drop-shadow-md">
                    {rulDays} <span className="text-sm text-slate-500 font-medium tracking-normal">days left</span>
                </Metric>
                <ProgressBar value={healthScore} color={status.badge as any} className="mt-5 h-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1f2937] group-hover:border-cyan-500/30 transition-colors">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Est. Failure</p>
                    <p className="text-sm text-cyan-400 mt-1 font-mono tracking-tighter drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
                        {new Date(Date.now() + rulDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1f2937] group-hover:border-amber-500/30 transition-colors">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Action Peak</p>
                    <p className="text-sm text-amber-500 mt-1 font-bold tracking-tight drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">Maintenance</p>
                </div>
            </div>
        </Card>
    );
}
