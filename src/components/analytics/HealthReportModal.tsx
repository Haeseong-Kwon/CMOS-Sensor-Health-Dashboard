"use client";

import React from 'react';
import {
    Dialog,
    DialogPanel,
    Title,
    Text,
    Button,
    Divider,
    Grid,
    Col,
    Card,
    List,
    ListItem,
    Flex
} from '@tremor/react';
import { SensorDevice, SensorAlert, HealthLog } from '@/types/sensor';
import { ShieldCheck, AlertCircle, Calendar, MapPin, Cpu, TrendingUp } from 'lucide-react';

interface HealthReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    sensor: SensorDevice;
    alerts: SensorAlert[];
    recentLogs: HealthLog[];
}

export default function HealthReportModal({ isOpen, onClose, sensor, alerts, recentLogs }: HealthReportModalProps) {
    const latestLog = recentLogs[0];

    return (
        <Dialog open={isOpen} onClose={onClose} static={true}>
            <DialogPanel className="bg-[#0f0f0f] border border-slate-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl">
                            <Cpu size={24} className="text-orange-500" />
                        </div>
                        <div>
                            <Title className="text-white text-2xl font-bold tracking-tight">{sensor.name} Diagnostics</Title>
                            <Text className="text-slate-400">{sensor.model} • Serial: {sensor.serial_number}</Text>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-emerald-500 text-sm font-bold uppercase tracking-wider">Verified Health</span>
                        </div>
                        <Text className="text-[10px] text-slate-500 mt-1 uppercase">Generated: {new Date().toLocaleString()}</Text>
                    </div>
                </div>

                <Divider className="bg-slate-800" />

                <Grid numItemsLg={3} className="gap-4 my-8">
                    <Card className="bg-white/5 border-none p-4">
                        <Text className="text-slate-500 text-xs uppercase font-bold">Location</Text>
                        <Flex className="mt-2 gap-2" justifyContent="start">
                            <MapPin size={14} className="text-orange-500" />
                            <span className="text-white text-sm font-medium">{sensor.location}</span>
                        </Flex>
                    </Card>
                    <Card className="bg-white/5 border-none p-4">
                        <Text className="text-slate-500 text-xs uppercase font-bold">Installed</Text>
                        <Flex className="mt-2 gap-2" justifyContent="start">
                            <Calendar size={14} className="text-orange-500" />
                            <span className="text-white text-sm font-medium">{new Date(sensor.installation_date).toLocaleDateString()}</span>
                        </Flex>
                    </Card>
                    <Card className="bg-white/5 border-none p-4">
                        <Text className="text-slate-500 text-xs uppercase font-bold">Last Reading</Text>
                        <Flex className="mt-2 gap-2" justifyContent="start">
                            <TrendingUp size={14} className="text-orange-500" />
                            <span className="text-white text-sm font-medium">{latestLog?.temperature ?? 0}°C</span>
                        </Flex>
                    </Card>
                </Grid>

                <div className="space-y-6">
                    <div>
                        <Title className="text-white text-lg flex items-center gap-2">
                            <AlertCircle size={18} className="text-orange-500" />
                            Recent Alerts & Anomalies
                        </Title>
                        <Card className="mt-4 bg-[#0a0a0a] border-slate-800 p-0 overflow-hidden">
                            <List>
                                {alerts.length > 0 ? alerts.map((alert) => (
                                    <ListItem key={alert.id} className="p-4 border-b border-slate-800 last:border-0">
                                        <div className="flex gap-3">
                                            <div className={`mt-1 p-1 rounded bg-${alert.alert_type === 'critical' ? 'red' : 'orange'}-500/10`}>
                                                <AlertCircle size={14} className={`text-${alert.alert_type === 'critical' ? 'red' : 'orange'}-500`} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium">{alert.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </ListItem>
                                )) : (
                                    <div className="p-6 text-center text-slate-600 italic text-sm">No anomalous activity detected recently.</div>
                                )}
                            </List>
                        </Card>
                    </div>

                    <div>
                        <Title className="text-white text-lg">Integrated Maintenance Prediction</Title>
                        <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-slate-800/50">
                            <Text className="text-slate-300">
                                Based on current degradation trends (0.12% per 24h), the CMOS array performance is projected to fall below
                                optimal thresholds in <strong>24.5 days</strong>. Recommended preventive maintenance window:
                                <span className="text-orange-500 font-bold ml-1">Feb 25 - Feb 28, 2026.</span>
                            </Text>
                            <div className="mt-6 flex gap-3">
                                <Button className="bg-orange-500 hover:bg-orange-600 border-none px-6">Schedule Maintenance</Button>
                                <Button variant="secondary" className="text-slate-400 border-slate-800 hover:bg-slate-800">Export Report (PDF)</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end">
                    <Button variant="light" onClick={onClose} className="text-slate-500 hover:text-white">Close Report</Button>
                </div>
            </DialogPanel>
        </Dialog>
    );
}
