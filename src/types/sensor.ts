export interface SensorDevice {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  installation_date: string;
  status: 'active' | 'maintenance' | 'offline';
  location: string;
  created_at: string;
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

export type RealtimeHealthLog = Omit<HealthLog, 'id'> & { id?: string };
