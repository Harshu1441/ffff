import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRealtimeStats } from '../../../../hooks/userealtimestats';

const MemoryUse = ({ initialData }) => {
  const [memoryData, setMemoryData] = useState([]);
  const stats = useRealtimeStats(initialData);

  useEffect(() => {
    if (stats?.memory_total && stats?.memory_used) {
      const usedMemory = parseFloat(stats.memory_used.toFixed(2));
      const totalMemory = parseFloat(stats.memory_total.toFixed(2));
      const freeMemory = parseFloat((totalMemory - usedMemory).toFixed(2));

      setMemoryData([
        {
          name: 'Memory',
          used: usedMemory,
          total: totalMemory,
          free: freeMemory,
          percentage: parseFloat(((usedMemory / totalMemory) * 100).toFixed(1))
        }
      ]);
    }
  }, [stats]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium text-gray-900">Memory Statistics</p>
          <p className="text-sm text-gray-600">Used: {payload[0].value} MB</p>
          <p className="text-sm text-gray-600">Free: {payload[1].value} MB</p>
          <p className="text-sm text-gray-600">Total: {memoryData[0]?.total} MB</p>
          <p className="text-sm text-gray-600">Usage: {memoryData[0]?.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">Memory Usage</h3>
        <span className="text-sm text-gray-500">
          {memoryData[0]?.percentage}% used
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={memoryData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            domain={[0, memoryData[0]?.total || 4000]}
            unit=" MB"
          />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="used" 
            stackId="a" 
            fill="#4f46e5" 
            name="Used Memory"
          />
          <Bar 
            dataKey="free" 
            stackId="a" 
            fill="#e5e7eb" 
            name="Free Memory"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemoryUse;
