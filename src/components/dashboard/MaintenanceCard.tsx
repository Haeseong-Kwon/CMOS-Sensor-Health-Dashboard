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
        if (score > 80) return { iconColor: 'text-emerald-500', bgColor: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'emerald', icon: ShieldCheck, text: 'Optimal' };
        if (score > 50) return { iconColor: 'text-amber-500', bgColor: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'amber', icon: ShieldAlert, text: 'Degrading' };
        return { iconColor: 'text-red-500', bgColor: 'bg-red-500/10', border: 'border-red-500/30', badge: 'red', icon: ShieldX, text: 'Critical' };
    };

    const status = getStatusStyles(healthScore);

    return (
        <Card className={`bg-gradient-to-br from-[#0f0f0f] to-[#151515] border ${status.border} shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group`}>
            <Flex alignItems="start" justifyContent="between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all ${status.bgColor} ${status.iconColor} group-hover:scale-110`}>
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
                <div className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group-hover:border-white/10 transition-colors">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Est. Failure</p>
                    <p className="text-sm text-white mt-1 font-mono tracking-tighter">
                        {new Date(Date.now() + rulDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/10 group-hover:border-orange-500/20 transition-colors">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Action Peak</p>
                    <p className="text-sm text-orange-500 mt-1 font-bold tracking-tight">Maintenance</p>
                </div>
            </div>
        </Card>
    );
}
