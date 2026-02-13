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

    const getStatusColor = (score: number) => {
        if (score > 80) return { color: 'emerald', icon: ShieldCheck, text: 'Optimal' };
        if (score > 50) return { color: 'amber', icon: ShieldAlert, text: 'Degrading' };
        return { color: 'red', icon: ShieldX, text: 'Critical' };
    };

    const status = getStatusColor(healthScore);

    return (
        <Card className="bg-[#0f0f0f] border-slate-800 shadow-lg">
            <Flex alignItems="start" justifyContent="between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${status.color}-500/10 text-${status.color}-500`}>
                        <status.icon size={20} />
                    </div>
                    <div>
                        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{name}</Text>
                        <Title className="text-white text-sm font-bold mt-0.5">{status.text} Condition</Title>
                    </div>
                </div>
                <Badge color={status.color as any} className="bg-opacity-10 text-[10px] font-bold uppercase tracking-tight">
                    Score: {healthScore}%
                </Badge>
            </Flex>

            <div className="mt-6">
                <Flex>
                    <Text className="text-slate-500 text-xs">Remaining Useful Life (RUL)</Text>
                    <Text className={`text-${status.color}-500 text-xs font-bold`}>{rulDays} Days</Text>
                </Flex>
                <Metric className="text-white mt-1 text-2xl tracking-tighter">
                    {rulDays} <span className="text-xs text-slate-500 font-medium">days left</span>
                </Metric>
                <ProgressBar value={healthScore} color={status.color as any} className="mt-4 h-1.5" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Est. Failure</p>
                    <p className="text-xs text-white mt-1 font-mono">
                        {new Date(Date.now() + rulDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Action Peak</p>
                    <p className="text-xs text-orange-500 mt-1 font-bold">Maintenance</p>
                </div>
            </div>
        </Card>
    );
}
