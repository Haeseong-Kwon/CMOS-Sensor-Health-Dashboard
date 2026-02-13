"use client";

import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { SensorAlert } from '@/types/sensor';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function AlertToast() {
    useEffect(() => {
        const channel = supabase
            .channel('sensor-alerts-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'sensor_alerts',
                },
                async (payload) => {
                    const newAlert = payload.new as SensorAlert;

                    // Fetch sensor name for better message
                    const { data: sensor } = await supabase
                        .from('sensor_devices')
                        .select('name')
                        .eq('id', newAlert.sensor_id)
                        .single();

                    const sensorName = sensor?.name || 'Unknown Sensor';

                    toast.custom((t) => (
                        <div className={`flex w-full max-w-sm items-start gap-4 rounded-xl border p-4 shadow-lg backdrop-blur-md ${newAlert.alert_type === 'critical'
                                ? 'bg-red-500/10 border-red-500/50 text-red-200'
                                : newAlert.alert_type === 'warning'
                                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-200'
                                    : 'bg-blue-500/10 border-blue-500/50 text-blue-200'
                            }`}>
                            <div className="mt-1">
                                {newAlert.alert_type === 'critical' ? (
                                    <AlertCircle size={20} className="text-red-500" />
                                ) : newAlert.alert_type === 'warning' ? (
                                    <AlertTriangle size={20} className="text-orange-500" />
                                ) : (
                                    <Info size={20} className="text-blue-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">[{sensorName}] {newAlert.alert_type.toUpperCase()}</p>
                                <p className="text-xs opacity-80 mt-1">{newAlert.message}</p>
                                <p className="text-[10px] opacity-50 mt-2">{new Date(newAlert.timestamp).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => toast.dismiss(t)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                &times;
                            </button>
                        </div>
                    ), {
                        duration: 5000,
                        position: 'top-right',
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return <Toaster expand={false} richColors closeButton />;
}
