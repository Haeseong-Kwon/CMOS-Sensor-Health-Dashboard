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
        <Card className={`transition-all duration-500 bg-[#0f0f0f] border-slate-800/50 ${isCurrentAnomaly ? 'ring-2 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'hover:border-orange-500/30'}`}>
            <Flex alignItems="start">
                <div className="flex-1">
                    <Title className="text-white flex items-center gap-2">
                        <Activity className={isCurrentAnomaly ? "text-red-500" : "text-orange-500"} size={18} />
                        Real-time Sensor Vitals
                    </Title>
                    <Text className="text-slate-400">Monitoring temperature and noise levels in real-time</Text>
                </div>
                {latestValue && (
                    <div className="text-right">
                        <Badge color={isCurrentAnomaly ? "red" : "orange"} icon={isCurrentAnomaly ? AlertTriangle : undefined}>
                            {isCurrentAnomaly ? "ALARM" : "LIVE"}
                        </Badge>
                        <div className={`mt-2 text-2xl font-bold tracking-tighter ${isCurrentAnomaly ? 'text-red-500' : 'text-white'}`}>
                            {latestValue.temperature.toFixed(1)}°C
                        </div>
                    </div>
                )}
            </Flex>

            <AreaChart
                className="mt-8 h-80"
                data={chartData}
                index="time"
                categories={['Temperature', 'Noise Level']}
                colors={isCurrentAnomaly ? ['red', 'rose'] : ['orange', 'blue']}
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
                        <div className="h-0.5 w-4 bg-orange-500 opacity-50" />
                        <Text className="text-[10px] text-slate-500 uppercase">Limit: {settings.temp_threshold}°C</Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-0.5 w-4 bg-blue-500 opacity-50" />
                        <Text className="text-[10px] text-slate-500 uppercase">Limit: {settings.noise_threshold}dB</Text>
                    </div>
                </div>
            )}
        </Card>
    );
}
