"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SensorDevice, SensorSettings } from '@/types/sensor';
import { Card, Title, Text, NumberInput, Button, Flex, Grid, Col, Divider, Badge } from '@tremor/react';
import { Settings, Save, RefreshCw, Thermometer, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ThresholdConfigProps {
    sensor: SensorDevice;
    onUpdate?: () => void;
}

export default function ThresholdConfig({ sensor, onUpdate }: ThresholdConfigProps) {
    const [settings, setSettings] = useState<SensorSettings>(sensor.settings || {
        temp_threshold: 65,
        noise_threshold: 120,
        update_interval: 1000
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('sensor_devices')
            .update({ settings })
            .eq('id', sensor.id);

        if (error) {
            toast.error('Failed to update settings: ' + error.message);
        } else {
            toast.success(`Settings updated for ${sensor.name}`);
            onUpdate?.();
        }
        setLoading(false);
    };

    return (
        <Card className="bg-[#0f0f0f] border-slate-800">
            <Flex alignItems="start" justifyContent="between">
                <div>
                    <Title className="text-white flex items-center gap-2">
                        <Settings className="text-orange-500" size={18} />
                        {sensor.name} Configuration
                    </Title>
                    <Text className="text-slate-400">Define operational thresholds and polling intervals.</Text>
                </div>
                <Badge color="slate" className="bg-slate-800 text-slate-400 border-slate-700">
                    {sensor.model}
                </Badge>
            </Flex>

            <Divider className="bg-slate-800" />

            <Grid numItemsLg={3} className="gap-6 mt-6">
                <div>
                    <Flex className="mb-2">
                        <Text className="text-white font-medium flex items-center gap-1.5">
                            <Thermometer size={14} className="text-orange-500" />
                            Temp Threshold (°C)
                        </Text>
                    </Flex>
                    <NumberInput
                        value={settings.temp_threshold}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, temp_threshold: v }))}
                        className="bg-slate-900 border-slate-800"
                    />
                </div>

                <div>
                    <Flex className="mb-2">
                        <Text className="text-white font-medium flex items-center gap-1.5">
                            <Zap size={14} className="text-orange-500" />
                            Noise Threshold (dB)
                        </Text>
                    </Flex>
                    <NumberInput
                        value={settings.noise_threshold}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, noise_threshold: v }))}
                        className="bg-slate-900 border-slate-800"
                    />
                </div>

                <div>
                    <Flex className="mb-2">
                        <Text className="text-white font-medium flex items-center gap-1.5">
                            <Clock size={14} className="text-orange-500" />
                            Update Interval (ms)
                        </Text>
                    </Flex>
                    <NumberInput
                        value={settings.update_interval}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, update_interval: v }))}
                        className="bg-slate-900 border-slate-800"
                    />
                </div>
            </Grid>

            <div className="mt-8 flex justify-end gap-3">
                <Button
                    variant="secondary"
                    icon={RefreshCw}
                    onClick={() => setSettings(sensor.settings || { temp_threshold: 65, noise_threshold: 120, update_interval: 1000 })}
                    className="border-slate-800 text-slate-400 hover:bg-slate-800"
                >
                    Reset
                </Button>
                <Button
                    loading={loading}
                    icon={Save}
                    onClick={handleSave}
                    className="bg-orange-500 hover:bg-orange-600 border-none shadow-lg shadow-orange-500/10"
                >
                    Save Changes
                </Button>
            </div>
        </Card>
    );
}
