"use client";

import React from 'react';
import RealtimeChart from '@/components/dashboard/RealtimeChart';
import { Card, Title, Text } from '@tremor/react';

export default function MonitoringPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Status Monitoring</h1>
                <p className="text-slate-400">Detailed real-time telemetry from the sensor network.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <RealtimeChart />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-[#0f0f0f] border-slate-800/50">
                        <Title className="text-white">Spectral Noise Analysis</Title>
                        <Text className="text-slate-500 mt-2 italic">Detailed noise floor analysis coming in Phase 2...</Text>
                        <div className="mt-10 h-40 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 flex items-center justify-center">
                            <span className="text-slate-600 text-sm">Hardware Abstraction Layer initializing...</span>
                        </div>
                    </Card>

                    <Card className="bg-[#0f0f0f] border-slate-800/50">
                        <Title className="text-white">Thermal Distribution</Title>
                        <Text className="text-slate-500 mt-2 italic">Spatial thermal mapping coming in Phase 2...</Text>
                        <div className="mt-10 h-40 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 flex items-center justify-center">
                            <span className="text-slate-600 text-sm">Thermal sensor array connecting...</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
