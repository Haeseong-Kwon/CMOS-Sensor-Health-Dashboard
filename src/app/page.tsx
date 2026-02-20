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
      const { data: sensorData } = await supabase.from('sensor_devices').select('*').limit(5);
      const { data: logData } = await supabase.from('sensor_health_logs').select('*').order('timestamp', { ascending: false }).limit(20);
      const { data: alertData } = await supabase.from('sensor_alerts').select('*').order('timestamp', { ascending: false }).limit(10);

      if (sensorData) setSensors(sensorData);
      if (logData) setRecentLogs(logData);
      if (alertData) setAlerts(alertData);
    };

    fetchData();
  }, []);

  const handleOpenReport = (sensor: SensorDevice) => {
    setSelectedSensor(sensor);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Predictive Maintenance Dashboard</h1>
          <p className="text-slate-400">Advanced diagnostic intelligence and future performance forecasting.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 w-8 rounded-full bg-slate-800 border-2 border-[#050505] flex items-center justify-center text-[10px] text-slate-500 font-bold">U{i}</div>
            ))}
          </div>
          <Button
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
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

        <Col numColSpanLg={2} className="space-y-6">
          <Card className="bg-[#0f0f0f] border-slate-800/50">
            <Title className="text-white">Active Sensor Array</Title>
            <div className="mt-4 space-y-4">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => handleOpenReport(sensor)}>
                  <div className="h-8 w-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Cpu size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sensor.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{sensor.status} • {sensor.location}</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-orange-500 transition-colors" />
                </div>
              ))}
            </div>
            <Button variant="light" className="w-full mt-6 text-xs text-slate-500" onClick={() => window.location.href = '/inventory'}>View All Sensors</Button>
          </Card>

          <Card className="bg-[#0f0f0f] border-slate-800/50">
            <Title className="text-white">Recent Anomalies</Title>
            <div className="mt-4 space-y-3">
              {alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className="flex gap-3 items-start border-l-2 border-orange-500 pl-3 py-1">
                  <div className="flex-1">
                    <p className="text-xs text-white font-medium line-clamp-1">{alert.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</p>
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
