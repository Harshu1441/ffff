import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useRealtimeStats } from '../../../../hooks/userealtimestats';

const Disk = ({ initialData }) => {
  const [diskData, setDiskData] = useState([]);
  const stats = useRealtimeStats(initialData);

  useEffect(() => {
    if (stats?.disk_total && stats?.disk_used) {
      const usedSpace = parseFloat(stats.disk_used.toFixed(2));
      const totalSpace = parseFloat(stats.disk_total.toFixed(2));
      const freeSpace = parseFloat((totalSpace - usedSpace).toFixed(2));
      const usagePercentage = parseFloat(((usedSpace / totalSpace) * 100).toFixed(1));

      setDiskData([
        { name: 'Used Space', value: usedSpace },
        { name: 'Free Space', value: freeSpace }
      ]);
    }
  }, [stats]);

  const COLORS = ['#4f46e5', '#e5e7eb'];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    try {
      const totalSpace = diskData.reduce((sum, item) => sum + item.value, 0).toFixed(2);
      const usedSpace = payload[0].value.toFixed(2);
      const usagePercentage = ((payload[0].value / parseFloat(totalSpace)) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium text-gray-900">Disk Statistics</p>
          <p className="text-sm text-gray-600">Used: {usedSpace} GB</p>
          <p className="text-sm text-gray-600">Free: {(totalSpace - usedSpace).toFixed(2)} GB</p>
          <p className="text-sm text-gray-600">Total: {totalSpace} GB</p>
          <p className="text-sm text-gray-600">Usage: {usagePercentage}%</p>
        </div>
      );
    } catch (error) {
      console.error('Error in CustomTooltip:', error);
      return null;
    }
  };

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">Disk Usage</h3>
        {diskData.length > 0 && (
          <span className="text-sm text-gray-500">
            {((diskData[0].value / diskData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% used
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={diskData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {diskData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => value === 'Used Space' ? 'Used' : 'Free'}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Disk;
