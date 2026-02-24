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
            <DialogPanel className="bg-[#050505] border border-[#1f2937] shadow-[0_0_50px_rgba(6,182,212,0.15)] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <Cpu size={24} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                        </div>
                        <div>
                            <Title className="text-white text-2xl font-bold tracking-tight">{sensor.name} Diagnostics</Title>
                            <Text className="text-slate-400">{sensor.model} • Serial: <span className="text-slate-300 font-mono">{sensor.serial_number}</span></Text>
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
                    <Card className="bg-[#0a0a0a] border border-[#1f2937] p-4 hover:border-cyan-500/30 transition-all">
                        <Text className="text-slate-500 text-xs uppercase font-bold tracking-widest">Location</Text>
                        <Flex className="mt-2 gap-2" justifyContent="start">
                            <MapPin size={14} className="text-cyan-400" />
                            <span className="text-white text-sm font-medium">{sensor.location}</span>
                        </Flex>
                    </Card>
                    <Card className="bg-[#0a0a0a] border border-[#1f2937] p-4 hover:border-cyan-500/30 transition-all">
                        <Text className="text-slate-500 text-xs uppercase font-bold tracking-widest">Installed</Text>
                        <Flex className="mt-2 gap-2" justifyContent="start">
                            <Calendar size={14} className="text-cyan-400" />
                            <span className="text-white text-sm font-medium">{new Date(sensor.installation_date).toLocaleDateString()}</span>
                        </Flex>
                    </Card>
                    <Card className="bg-[#0a0a0a] border border-[#1f2937] p-4 hover:border-amber-500/30 transition-all">
                        <Text className="text-slate-500 text-xs uppercase font-bold tracking-widest">Last Reading</Text>
                        <Flex className="mt-2 gap-2" justifyContent="start">
                            <TrendingUp size={14} className="text-amber-500" />
                            <span className="text-white text-sm font-medium">{latestLog?.temperature ?? 0}°C</span>
                        </Flex>
                    </Card>
                </Grid>

                <div className="space-y-6">
                    <div>
                        <Title className="text-white text-lg flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" />
                            Recent Alerts & Anomalies
                        </Title>
                        <Card className="mt-4 bg-[#050505] border-[#1f2937] p-0 overflow-hidden shadow-inner">
                            <List>
                                {alerts.length > 0 ? alerts.map((alert) => (
                                    <ListItem key={alert.id} className="p-4 border-b border-[#1f2937] last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex gap-3">
                                            <div className={`mt-1 p-1 rounded bg-${alert.alert_type === 'critical' ? 'red' : 'amber'}-500/10`}>
                                                <AlertCircle size={14} className={`text-${alert.alert_type === 'critical' ? 'red' : 'amber'}-500`} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium">{alert.message}</p>
                                                <p className="text-xs text-slate-500 mt-1 font-mono">{new Date(alert.timestamp).toLocaleString()}</p>
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
                        <div className="mt-4 p-6 rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-black border border-[#1f2937] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none" />
                            <Text className="text-slate-300 relative z-10 leading-relaxed">
                                Based on current degradation trends (0.12% per 24h), the CMOS array performance is projected to fall below
                                optimal thresholds in <strong className="text-white drop-shadow-md">24.5 days</strong>. Recommended preventive maintenance window:
                                <span className="text-cyan-400 font-bold ml-1 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">Feb 25 - Feb 28, 2026.</span>
                            </Text>
                            <div className="mt-6 flex gap-3 relative z-10">
                                <Button className="bg-cyan-600 hover:bg-cyan-500 border-none px-6 shadow-[0_0_15px_rgba(6,182,212,0.4)] text-white">Schedule Maintenance</Button>
                                <Button variant="secondary" className="text-slate-300 border-[#1f2937] hover:bg-[#1a1a1a]">Export Report (PDF)</Button>
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
