"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SensorDevice } from '@/types/sensor';
import ThresholdConfig from '@/components/settings/ThresholdConfig';
import { Card, Title, Text, TabGroup, TabList, Tab, TabPanels, TabPanel, Badge } from '@tremor/react';
import { Settings, Cpu, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
    const [sensors, setSensors] = useState<SensorDevice[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSensors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sensor_devices')
            .select('*')
            .order('name', { ascending: true });

        if (data) setSensors(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Settings</h1>
                <p className="text-slate-400">Manage global thresholds and individual sensor configurations.</p>
            </div>

            <TabGroup>
                <TabList className="bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    <Tab icon={Cpu}>Sensor Configs</Tab>
                    <Tab icon={ShieldAlert}>Security & Access</Tab>
                    <Tab icon={Settings}>Global Rules</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <div className="mt-8 space-y-6">
                            {sensors.length > 0 ? (
                                sensors.map((sensor) => (
                                    <ThresholdConfig key={sensor.id} sensor={sensor} onUpdate={fetchSensors} />
                                ))
                            ) : (
                                <Card className="bg-[#0f0f0f] border-slate-800 p-12 text-center">
                                    <Text className="text-slate-500 italic">No sensors found to configure.</Text>
                                </Card>
                            )}
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="mt-8">
                            <Card className="bg-[#0f0f0f] border-slate-800 p-8">
                                <Title className="text-white">API Keys & Authentication</Title>
                                <Text className="mt-2 text-slate-400 italic">Access control management coming in Phase 3...</Text>
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="mt-8">
                            <Card className="bg-[#0f0f0f] border-slate-800 p-8">
                                <Title className="text-white">Automated Response Rules</Title>
                                <Text className="mt-2 text-slate-400 italic">Global failure handling coming in Phase 3...</Text>
                            </Card>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}
