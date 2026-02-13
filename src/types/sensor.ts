export interface SensorSettings {
  temp_threshold: number;
  noise_threshold: number;
  update_interval: number;
}

export interface SensorDevice {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  installation_date: string;
  status: 'active' | 'maintenance' | 'offline';
  location: string;
  created_at: string;
  settings?: SensorSettings;
}

export interface HealthLog {
  id: string;
  sensor_id: string;
  temperature: number;
  noise_level: number;
  voltage: number;
  timestamp: string;
  status_code: string;
  notes?: string;
}

export interface SensorAlert {
  id: string;
  sensor_id: string;
  alert_type: 'critical' | 'warning' | 'info';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  is_read: boolean;
  sensor_devices?: {
    name: string;
  };
}

export type RealtimeHealthLog = Omit<HealthLog, 'id'> & { id?: string };
