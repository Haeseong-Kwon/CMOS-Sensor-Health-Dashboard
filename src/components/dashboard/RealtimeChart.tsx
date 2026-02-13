"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Card, Title, Text, Flex, Badge } from '@tremor/react';
import { supabase } from '@/lib/supabase';
import { HealthLog } from '@/types/sensor';
import { Activity } from 'lucide-react';

interface RealtimeChartProps {
    sensorId?: string;
}

export default function RealtimeChart({ sensorId }: RealtimeChartProps) {
    const [data, setData] = useState<HealthLog[]>([]);
    const [latestValue, setLatestValue] = useState<HealthLog | null>(null);

    useEffect(() => {
        // Initial fetch
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

        // Subscribe to real-time updates
        const channel = supabase
            .channel('schema-db-changes')
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
    }));

    return (
        <Card className="bg-[#0f0f0f] border-slate-800/50 hover:border-orange-500/30 transition-colors duration-300">
            <Flex alignItems="start">
                <div className="flex-1">
                    <Title className="text-white flex items-center gap-2">
                        <Activity className="text-orange-500" size={18} />
                        Real-time Sensor Vitals
                    </Title>
                    <Text className="text-slate-400">Monitoring temperature and noise levels in real-time</Text>
                </div>
                {latestValue && (
                    <div className="text-right">
                        <Badge color="orange">Live</Badge>
                        <div className="mt-2 text-2xl font-bold text-white tracking-tighter">
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
                colors={['orange', 'blue']}
                valueFormatter={(number: number) => `${number.toFixed(2)}`}
                showAnimation={true}
                showLegend={true}
                curveType="monotone"
            />
        </Card>
    );
}
