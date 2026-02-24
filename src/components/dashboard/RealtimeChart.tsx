"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Card, Title, Text, Flex, Badge } from '@tremor/react';
import { supabase } from '@/lib/supabase';
import { HealthLog, SensorSettings } from '@/types/sensor';
import { Activity, AlertTriangle } from 'lucide-react';

interface RealtimeChartProps {
    sensorId?: string;
}

export default function RealtimeChart({ sensorId }: RealtimeChartProps) {
    const [data, setData] = useState<HealthLog[]>([]);
    const [latestValue, setLatestValue] = useState<HealthLog | null>(null);
    const [settings, setSettings] = useState<SensorSettings | null>(null);

    // Fetch settings for the sensor
    useEffect(() => {
        const fetchSettings = async () => {
            if (!sensorId) return;
            const { data: sensor } = await supabase
                .from('sensor_devices')
                .select('settings')
                .eq('id', sensorId)
                .single();

            if (sensor?.settings) {
                setSettings(sensor.settings);
            }
        };

        fetchSettings();
    }, [sensorId]);

    useEffect(() => {
        const fetchData = async () => {
            let query = supabase
                .from('sensor_health_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(20);

            if (sensorId) {
                query = query.eq('sensor_id', sensorId);
            }

            const { data: logs, error } = await query;
            if (error) console.error('Error fetching logs:', error);
            if (logs) {
                const sortedLogs = logs.reverse();
                setData(sortedLogs);
                setLatestValue(sortedLogs[sortedLogs.length - 1]);
            }
        };

        fetchData();

        const channel = supabase
            .channel(`sensor-logs-${sensorId || 'all'}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'sensor_health_logs',
                    filter: sensorId ? `sensor_id=eq.${sensorId}` : undefined,
                },
                (payload) => {
                    const newLog = payload.new as HealthLog;
                    setData((prev) => [...prev.slice(-19), newLog]);
                    setLatestValue(newLog);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sensorId]);

    const chartData = data.map((log) => ({
        time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        Temperature: log.temperature,
        'Noise Level': log.noise_level,
        // Add anomaly flag for visualization
        isAnomaly: settings ? (log.temperature > settings.temp_threshold || log.noise_level > settings.noise_threshold) : false
    }));

    const isCurrentAnomaly = latestValue && settings && (
        latestValue.temperature > settings.temp_threshold ||
        latestValue.noise_level > settings.noise_threshold
    );

    return (
        <Card className={`transition-all duration-700 bg-[#050505] border ${isCurrentAnomaly ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 'border-[#1f2937] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'} shadow-2xl group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none" />
            <Flex alignItems="start" className="relative z-10">
                <div className="flex-1">
                    <Title className="text-white flex items-center gap-2 text-lg tracking-tight">
                        <Activity className={isCurrentAnomaly ? "text-red-500 animate-pulse" : "text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all"} size={20} />
                        Real-time Sensor Vitals
                    </Title>
                    <Text className="text-slate-400 text-xs mt-1">Monitoring temperature and noise levels in real-time</Text>
                </div>
                {latestValue && (
                    <div className="text-right">
                        <Badge color={isCurrentAnomaly ? "red" : "amber"} icon={isCurrentAnomaly ? AlertTriangle : undefined} className="bg-opacity-10 text-[10px] uppercase font-bold tracking-widest shadow-sm">
                            {isCurrentAnomaly ? "ALARM" : "LIVE FEED"}
                        </Badge>
                        <div className={`mt-2 text-3xl font-bold tracking-tighter drop-shadow-lg ${isCurrentAnomaly ? 'text-red-500' : 'text-white'}`}>
                            {latestValue.temperature.toFixed(1)}<span className="text-sm text-slate-500 font-medium ml-1">°C</span>
                        </div>
                    </div>
                )}
            </Flex>

            <AreaChart
                className="mt-8 h-80 drop-shadow-md"
                data={chartData}
                index="time"
                categories={['Temperature', 'Noise Level']}
                colors={isCurrentAnomaly ? ['red', 'rose'] : ['cyan', 'emerald']}
                valueFormatter={(number: number) => `${number.toFixed(2)}`}
                showAnimation={true}
                showLegend={true}
                curveType="monotone"
            // In Tremor, we don't have built-in point highlighting easily, 
            // but changing colors based on overall state is a strong signal.
            // We could also add a reference line if settings exist.
            />

            {settings && (
                <div className="mt-4 flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-4 bg-cyan-500 opacity-80 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                        <Text className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Limit: {settings.temp_threshold}°C</Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-4 bg-emerald-500 opacity-80 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                        <Text className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Limit: {settings.noise_threshold}dB</Text>
                    </div>
                </div>
            )}
        </Card>
    );
}
