import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtimeStats } from '../../../../hooks/useRealtimeStats';

const NetworkTraffic = ({ initialData }) => {
  const stats = useRealtimeStats(initialData);

  const networkData = useMemo(() => [
    { time: '0s', sent: stats?.network_sent || 0, received: stats?.network_recv || 0 },
    { 
      time: '10s', 
      sent: Math.max(0, (stats?.network_sent || 0) + Math.random() * 20 - 10),
      received: Math.max(0, (stats?.network_recv || 0) + Math.random() * 20 - 10)
    },
    { 
      time: '20s',
      sent: Math.max(0, (stats?.network_sent || 0) + Math.random() * 20 - 10),
      received: Math.max(0, (stats?.network_recv || 0) + Math.random() * 20 - 10)
    },
    { 
      time: '30s',
      sent: Math.max(0, (stats?.network_sent || 0) + Math.random() * 20 - 10),
      received: Math.max(0, (stats?.network_recv || 0) + Math.random() * 20 - 10)
    },
  ], [stats]);

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Network Traffic</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={networkData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis unit=" KB/s" />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="sent" 
            stroke="#4f46e5" 
            name="Sent" 
            unit=" KB/s"
          />
          <Line 
            type="monotone" 
            dataKey="received" 
            stroke="#10b981" 
            name="Received" 
            unit=" KB/s"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkTraffic;
