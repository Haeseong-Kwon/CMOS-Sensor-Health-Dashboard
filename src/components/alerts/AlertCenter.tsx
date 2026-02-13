"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SensorAlert } from '@/types/sensor';
import { Bell, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { Badge, Card, Text, Divider, Button } from '@tremor/react';

export default function AlertCenter() {
    const [alerts, setAlerts] = useState<SensorAlert[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = alerts.filter(a => !a.is_read).length;

    const fetchAlerts = async () => {
        const { data, error } = await supabase
            .from('sensor_alerts')
            .select('*, sensor_devices(name)')
            .order('timestamp', { ascending: false })
            .limit(5);

        if (data) setAlerts(data);
    };

    useEffect(() => {
        fetchAlerts();

        const channel = supabase
            .channel('alert-center-sync')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_alerts' },
                () => fetchAlerts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAllAsRead = async () => {
        await supabase
            .from('sensor_alerts')
            .update({ is_read: true })
            .eq('is_read', false);

        fetchAlerts();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50"
            >
                <Bell size={20} className={unreadCount > 0 ? "text-orange-500 animate-swing" : "text-slate-400"} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#050505]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Card className="bg-[#0f0f0f] border-slate-800 p-0 overflow-hidden shadow-2xl">
                        <div className="p-4 flex items-center justify-between bg-white/5">
                            <span className="text-sm font-bold text-white">Sensor Activity</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] text-orange-500 hover:text-orange-400 font-medium uppercase tracking-wider"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <Divider className="m-0 bg-slate-800" />

                        <div className="max-h-96 overflow-y-auto">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 border-b border-slate-800/50 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${!alert.is_read ? 'bg-orange-500/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5">
                                                {alert.alert_type === 'critical' ? (
                                                    <AlertCircle size={16} className="text-red-500" />
                                                ) : alert.alert_type === 'warning' ? (
                                                    <AlertTriangle size={16} className="text-orange-500" />
                                                ) : (
                                                    <Info size={16} className="text-blue-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[12px] font-bold text-white truncate">
                                                        {alert.sensor_devices?.name}
                                                    </p>
                                                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                                    {alert.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <Text className="text-slate-500 italic">No recent alerts</Text>
                                </div>
                            )}
                        </div>

                        <Divider className="m-0 bg-slate-800" />
                        <div className="p-2">
                            <Button
                                variant="light"
                                className="text-xs text-slate-400 hover:text-white w-full"
                                onClick={() => setIsOpen(false)}
                            >
                                Close Panel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
