import RealtimeChart from '@/components/dashboard/RealtimeChart';
import { Card, Title, Text, Grid, Col, Metric, BadgeDelta, Flex } from '@tremor/react';
import { Zap, Shield, AlertTriangle, Cpu } from 'lucide-react';

const stats = [
  { name: 'Active Sensors', stat: '12', icon: Cpu, delta: '+2', deltaType: 'moderateIncrease' },
  { name: 'Power Avg', stat: '5.2V', icon: Zap, delta: '0.1', deltaType: 'unchanged' },
  { name: 'Health Score', stat: '98%', icon: Shield, delta: '+1%', deltaType: 'moderateIncrease' },
  { name: 'Alerts', stat: '0', icon: AlertTriangle, delta: '0', deltaType: 'unchanged' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sensor Health Overview</h1>
        <p className="text-slate-400">Real-time diagnostics and performance monitoring for your CMOS array.</p>
      </div>

      <Grid numItemsLg={4} className="gap-6">
        {stats.map((item) => (
          <Card key={item.name} className="bg-[#0f0f0f] border-slate-800/50">
            <Flex alignItems="start" justifyContent="between">
              <div>
                <Text className="text-slate-400 font-medium">{item.name}</Text>
                <Metric className="text-white mt-1">{item.stat}</Metric>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg">
                <item.icon className="text-orange-500" size={20} />
              </div>
            </Flex>
            <div className="mt-4 flex items-center gap-2">
              <BadgeDelta deltaType={item.deltaType as any} isIncreasePositive={true}>
                {item.delta}
              </BadgeDelta>
              <Text className="text-xs text-slate-500">vs last hour</Text>
            </div>
          </Card>
        ))}
      </Grid>

      <Grid numItemsLg={6} className="gap-6">
        <Col numColSpanLg={4}>
          <RealtimeChart />
        </Col>
        <Col numColSpanLg={2}>
          <Card className="bg-[#0f0f0f] border-slate-800/50 h-full">
            <Title className="text-white">Recent Logs</Title>
            <div className="mt-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="h-8 w-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs font-bold">
                    #{i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Sensor Alpha-{i}</p>
                    <p className="text-xs text-slate-500">Online • 2m ago</p>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Grid>
    </div>
  );
}
