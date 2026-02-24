"use client";

import React, { useState, useEffect } from 'react';
import RealtimeChart from '@/components/dashboard/RealtimeChart';
import MaintenanceCard from '@/components/dashboard/MaintenanceCard';
import PredictiveChart from '@/components/analytics/PredictiveChart';
import HealthReportModal from '@/components/analytics/HealthReportModal';
import { Card, Title, Text, Grid, Col, Metric, BadgeDelta, Flex, Button } from '@tremor/react';
import { Zap, Shield, AlertTriangle, Cpu, ExternalLink, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SensorDevice, SensorAlert, HealthLog } from '@/types/sensor';
import SensorMappingViewer from '@/components/dashboard/SensorMappingViewer';

export default function DashboardPage() {
  const [sensors, setSensors] = useState<SensorDevice[]>([]);
  const [recentLogs, setRecentLogs] = useState<HealthLog[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorDevice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMapping, setShowMapping] = useState(false);

  const handleUpload = () => {
    // Simulation of file upload and processing
    setIsAnalyzing(true);
    setShowMapping(true);

    // Simulate processing time then finish
    setTimeout(() => {
      setIsAnalyzing(true); // Keep scanning for a bit
      setTimeout(() => {
        setIsAnalyzing(false); // Stop scanning, keep result
      }, 5000);
    }, 1000);
  };

  useEffect(() => {
    const fetchData = async () => {
      let { data: sensorData } = await supabase.from('sensor_devices').select('*').limit(5);
      let { data: logData } = await supabase.from('sensor_health_logs').select('*').order('timestamp', { ascending: false }).limit(20);
      let { data: alertData } = await supabase.from('sensor_alerts').select('*').order('timestamp', { ascending: false }).limit(10);

      // MOCK DATA FALLBACK FOR DEMO
      if (!sensorData || sensorData.length === 0) {
        sensorData = [
          { id: '1', name: 'Alpha-X1', status: 'active', location: 'Cleanroom A', model: 'CMOS-X100' },
          { id: '2', name: 'Beta-Y2', status: 'active', location: 'Assembly Line B', model: 'CMOS-Y200' },
          { id: '3', name: 'Gamma-Z3', status: 'warning', location: 'Testing Lab C', model: 'CMOS-Z300' }
        ] as any;
      }
      if (!logData || logData.length === 0) {
        const now = Date.now();
        logData = Array.from({ length: 20 }).map((_, i) => ({
          timestamp: new Date(now - i * 60000).toISOString(),
          temperature: 55 + Math.random() * 15,
          noise_level: 20 + Math.random() * 10,
          defect_count: Math.floor(Math.random() * 5),
          sensor_id: '1'
        })) as any;
      }
      if (!alertData || alertData.length === 0) {
        alertData = [
          { id: 'a1', sensor_id: '1', message: 'Thermal spike detected > 65°C', severity: 'high', timestamp: new Date().toISOString() },
          { id: 'a2', sensor_id: '3', message: 'Noise level threshold exceeded', severity: 'medium', timestamp: new Date(Date.now() - 3600000).toISOString() }
        ] as any;
      }

      setSensors(sensorData || []);
      setRecentLogs(logData || []);
      setAlerts(alertData || []);
    };

    fetchData();
  }, []);

  const handleOpenReport = (sensor: SensorDevice) => {
    setSelectedSensor(sensor);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none -m-8" />
      <div className="flex items-end justify-between relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Predictive Maintenance Dashboard</h1>
          <p className="text-cyan-500/80 font-mono text-sm uppercase tracking-widest font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            Advanced diagnostic intelligence & future performance forecasting
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-9 w-9 rounded-full bg-[#0a0a0a] border-2 border-[#1f2937] flex items-center justify-center text-[10px] text-cyan-500 font-bold z-[1]">U{i}</div>
            ))}
          </div>
          <Button
            className="bg-cyan-600 hover:bg-cyan-500 text-white border-none shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all font-bold px-6 py-2 h-10"
            icon={UploadCloud}
            onClick={handleUpload}
          >
            Upload Sensor Log
          </Button>
        </div>
      </div>

      {/* Top Section: Predictive Analytics Widgets */}
      <Grid numItemsLg={3} className="gap-6">
        {sensors.slice(0, 3).map((sensor, idx) => (
          <MaintenanceCard
            key={sensor.id}
            name={sensor.name}
            currentValue={idx === 0 ? 62 : idx === 1 ? 45 : 58} // Mock data for demo
            threshold={65}
            rulDays={idx === 0 ? 12 : idx === 1 ? 48 : 24}
          />
        ))}
      </Grid>

      <Grid numItemsLg={6} className="gap-6">
        <Col numColSpanLg={4} className="space-y-6">
          {showMapping ? (
            <SensorMappingViewer isAnalyzing={isAnalyzing} />
          ) : (
            <RealtimeChart />
          )}
          <PredictiveChart
            data={recentLogs.map(l => ({ timestamp: l.timestamp, value: l.temperature }))}
            threshold={65}
            title="Thermal Integrity"
            unit="°C"
          />
        </Col>

        <Col numColSpanLg={2} className="space-y-6 relative z-10">
          <Card className="bg-[#050505] border-[#1f2937] shadow-xl">
            <Title className="text-white tracking-tight flex items-center gap-2">
              <Cpu size={18} className="text-cyan-500" />
              Active Sensor Array
            </Title>
            <div className="mt-4 space-y-4">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="group flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0a] border border-[#1f2937] hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all cursor-pointer" onClick={() => handleOpenReport(sensor)}>
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Cpu size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{sensor.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-0.5">{sensor.status} • {sensor.location}</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              ))}
            </div>
            <Button variant="light" className="w-full mt-6 text-xs text-slate-500 hover:text-cyan-400 font-bold tracking-widest uppercase transition-colors" onClick={() => window.location.href = '/inventory'}>View All Sensors</Button>
          </Card>

          <Card className="bg-[#050505] border-[#1f2937] shadow-xl">
            <Title className="text-white tracking-tight flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Recent Anomalies
            </Title>
            <div className="mt-4 space-y-3">
              {alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className="flex gap-3 items-start border-l-2 border-red-500/80 bg-[#0a0a0a] p-3 rounded-r-xl">
                  <div className="flex-1">
                    <p className="text-xs text-slate-200 font-bold line-clamp-1">{alert.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Grid>

      {selectedSensor && (
        <HealthReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sensor={selectedSensor}
          alerts={alerts.filter(a => a.sensor_id === selectedSensor.id)}
          recentLogs={recentLogs.filter(l => l.sensor_id === selectedSensor.id)}
        />
      )}
    </div>
  );
}
