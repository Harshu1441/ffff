import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtimeStats } from '../../../../hooks/useRealtimeStats';

const CPU = ({ initialData }) => {
  const stats = useRealtimeStats(initialData);

  const cpuData = useMemo(() => [
    { time: '0s', value: stats?.cpu || 0 },
    { time: '10s', value: Math.max(0, (stats?.cpu || 0) + Math.random() * 10 - 5) },
    { time: '20s', value: Math.max(0, (stats?.cpu || 0) + Math.random() * 10 - 5) },
    { time: '30s', value: Math.max(0, (stats?.cpu || 0) + Math.random() * 10 - 5) },
  ], [stats]);

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-4">CPU Usage</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cpuData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis unit="%" />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#4f46e5" 
            fill="#4f46e5" 
            fillOpacity={0.2} 
            name="CPU Usage"
            unit="%"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CPU;
