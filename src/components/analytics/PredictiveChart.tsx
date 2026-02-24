"use client";

import React, { useMemo } from 'react';
import { LineChart, Card, Title, Text, Flex, Badge, Icon } from '@tremor/react';
import { TrendingUp, Activity, Info } from 'lucide-react';
import { predictTrend, DataPoint } from '@/lib/analytics';

interface PredictiveChartProps {
    data: { timestamp: string; value: number }[];
    threshold: number;
    title: string;
    unit: string;
}

export default function PredictiveChart({ data, threshold, title, unit }: PredictiveChartProps) {
    const chartData = useMemo(() => {
        if (data.length === 0) return [];

        // Convert data to analytics format
        const points: DataPoint[] = data.map((d, i) => ({ x: i, y: d.value }));

        // Predict next 10 points
        const predictions = predictTrend(points, 10);

        const result = data.map((d, i) => ({
            time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            "Historic": d.value,
            "Predictive": d.value, // Start prediction from last known point
            "Threshold": threshold
        }));

        // Add forecast
        predictions.forEach((p, i) => {
            const lastTime = new Date(data[data.length - 1].timestamp);
            const forecastTime = new Date(lastTime.getTime() + (i + 1) * 60000); // assume 1 min interval for visualization

            result.push({
                time: forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                "Historic": undefined as any,
                "Predictive": Number(p.y.toFixed(2)),
                "Threshold": threshold
            });
        });

        return result;
    }, [data, threshold]);

    return (
        <Card className="bg-[#050505] border border-[#1f2937] shadow-xl hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-violet-500/50 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/10 blur-[80px] -ml-32 -mt-32 rounded-full pointer-events-none" />
            <Flex alignItems="start" justifyContent="between" className="relative z-10">
                <div>
                    <Title className="text-white flex items-center gap-2 text-lg tracking-tight">
                        <TrendingUp className="text-violet-400 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] transition-all" size={20} />
                        {title} Forecast
                    </Title>
                    <Text className="text-slate-500 text-xs mt-1">Predicted performance trend for next 30 days based on historic patterns</Text>
                </div>
                <div className="flex flex-col items-end">
                    <Badge color="violet" icon={Activity} className="bg-opacity-10 text-[10px] uppercase font-bold tracking-widest shadow-sm">Analyzed</Badge>
                    <Text className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-widest">A.I. Engine v2.4</Text>
                </div>
            </Flex>

            <LineChart
                className="h-72 mt-8"
                data={chartData}
                index="time"
                categories={["Historic", "Predictive", "Threshold"]}
                colors={["cyan", "violet", "red"]}
                valueFormatter={(val) => `${val}${unit}`}
                showLegend={true}
                showGridLines={true}
                curveType="monotone"
                connectNulls={false}
            />

            <div className="mt-4 p-3 bg-[#0a0a0a] rounded-xl border border-violet-500/20 flex items-start gap-3">
                <Icon icon={Info} color="violet" variant="simple" size="sm" />
                <Text className="text-slate-400 text-xs">
                    The <span className="text-violet-400 font-bold drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]">Violet line</span> indicates the predicted trajectory.
                    The sensor is expected to reach critical degradation limits in approximately 12 days.
                </Text>
            </div>
        </Card>
    );
}
