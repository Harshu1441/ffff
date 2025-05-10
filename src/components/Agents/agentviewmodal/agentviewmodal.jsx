import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { X, Activity, HardDrive, MemoryStick, Network, Cpu, List, Shield, Users } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import base_Api from '../../../../utils/baseApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Detail Modal Component
const DetailModal = ({ title, items, isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && 
          e.target.classList.contains('backdrop-blur-sm')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Filter items based on search query with safety checks
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      if (!item) return false;
      
      if (typeof item === 'string') {
        return item.toLowerCase().includes((searchQuery || '').toLowerCase());
      }
      
      if (typeof item === 'object' && item.name) {
        return item.name.toLowerCase().includes((searchQuery || '').toLowerCase());
      }
      
      return false;
    });
  }, [items, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {!Array.isArray(items) || filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {searchQuery ? 'No matching items found' : 'No items found'}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              // For active apps, item is a string
              if (typeof item === 'string') {
                return (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  </div>
                );
              }
              
              // For other items (rules, groups)
              const itemName = item.name;
              const itemPath = item.path;
              const itemPid = item.pid;
              const itemPriority = item.priority;
              const itemMembers = item.members;

              return (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{itemName}</span>
                    {itemPath && (
                      <span className="text-xs text-gray-500">{itemPath}</span>
                    )}
                    {itemPid && (
                      <span className="text-xs text-gray-500">PID: {itemPid}</span>
                    )}
                  </div>
                  {itemPriority && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      itemPriority === 'High' ? 'bg-red-100 text-red-800' :
                      itemPriority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {itemPriority}
                    </span>
                  )}
                  {itemMembers && (
                    <span className="text-xs text-gray-500">{itemMembers} members</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Create a separate stateless component for each chart to prevent full re-renders
const MetricChart = React.memo(({ title, icon, value, color, chartData, chartOptions, IconComponent }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <IconComponent className={`h-5 w-5 mr-2 text-${color}-500`} />
          <h4 className="text-lg font-semibold">{title}</h4>
        </div>
        <span className={`text-2xl font-bold text-${color}-500`}>
          {value}
        </span>
      </div>
      <div className="h-48">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
});

// Network Usage Chart component with special formatting for two values
const NetworkChart = React.memo(({ sentValue, recvValue, chartData, chartOptions, IconComponent }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <IconComponent className="h-5 w-5 mr-2 text-orange-500" />
          <h4 className="text-lg font-semibold">Network Usage</h4>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-orange-500">
            {sentValue}
          </div>
          <div className="text-lg font-bold text-orange-500">
            {recvValue}
          </div>
        </div>
      </div>
      <div className="h-48">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
});

// Stateless component for basic info to avoid unnecessary re-renders
const AgentInfo = React.memo(({ systemStatus, agent }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-lg font-semibold mb-2">System Information</h4>
      <div className="space-y-2">
        <p><span className="font-medium">PC Name:</span> {systemStatus?.pc_name || agent?.agent_id || 'N/A'}</p>
        <p><span className="font-medium">IP Address:</span> {systemStatus?.pc_ip || 'N/A'}</p>
        <p><span className="font-medium">Last Updated:</span> {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

// Stateless component for stats cards to avoid unnecessary re-renders
const StatCard = React.memo(({ title, count, color, onClick, Icon }) => {
  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </div>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
});

const AgentViewModal = ({ agent, isOpen, onClose }) => {
  const modalRef = useRef(null);
  const wsRef = useRef(null);
  const [activeAppsModalOpen, setActiveAppsModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [groupsModalOpen, setGroupsModalOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState({
    cpu: [],
    memory: [],
    disk: [],
    network: [],
    timestamps: []
  });
  const [rules, setRules] = useState([]);

  const updateHistoricalData = useCallback((newStatus) => {
    if (!newStatus || !newStatus.stats) return;

    setHistoricalData(prev => {
      const newData = { ...prev };
      const now = new Date().toLocaleTimeString();

      // Add new data points (with safety checks)
      newData.cpu.push(newStatus.stats.cpu || 0);
      newData.memory.push((newStatus.stats.memory_used || 0) / 1024); // Convert to GB
      newData.disk.push((newStatus.stats.disk_used || 0) / 1024); // Convert to GB
      newData.network.push({
        sent: newStatus.stats.network_sent || 0,
        recv: newStatus.stats.network_recv || 0
      });
      newData.timestamps.push(now);

      // Keep only last 10 data points
      if (newData.cpu.length > 10) {
        newData.cpu.shift();
        newData.memory.shift();
        newData.disk.shift();
        newData.network.shift();
        newData.timestamps.shift();
      }

      return newData;
    });
  }, []);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!agent || !isOpen) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const wsUrl = `${base_Api.replace('http', 'ws')}ws/agent/${agent.agent_id}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsLoading(false);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update system status
        if (data.type === 'status') {
          setSystemStatus(data.payload);
          updateHistoricalData(data.payload);
        }
        
        // Update rules
        if (data.type === 'rules') {
          setRules(data.payload);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to establish real-time connection');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }, [agent, isOpen, updateHistoricalData]);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    if (!agent || !isOpen) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch initial system status
      const statusResponse = await fetch(`${base_Api}status`);
      if (!statusResponse.ok) throw new Error('Failed to fetch system status');
      const statusData = await statusResponse.json();
      
      const agentStatus = statusData.find(status => {
        if (!status) return false;
        return status.pc_name === agent.agent_id || 
               status._id === agent.agent_id ||
               status.pc_ip === agent.agent_id;
      });
      
      if (agentStatus && agentStatus.stats) {
        setSystemStatus(agentStatus);
        updateHistoricalData(agentStatus);
      }

      // Fetch initial rules
      const rulesResponse = await fetch(`${base_Api}get_rules?agent_name=${encodeURIComponent(agent.agent_id)}`);
      if (!rulesResponse.ok) throw new Error('Failed to fetch rules');
      const rulesData = await rulesResponse.json();
      if (rulesData && Array.isArray(rulesData.rules)) {
        setRules(rulesData.rules);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [agent, isOpen, updateHistoricalData]);

  useEffect(() => {
    if (isOpen && agent) {
      fetchInitialData();
      initializeWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, agent, fetchInitialData, initializeWebSocket]);

  // Chart options - memoized to prevent re-creation on each render
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}${context.dataset.label.includes('GB') ? 'GB' : '%'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0
      }
    }
  }), []);

  // Network chart options with legend displayed
  const networkChartOptions = useMemo(() => ({
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  }), [chartOptions]);

  // Chart data - memoized to prevent re-creation on each render
  const cpuChartData = useMemo(() => ({
    labels: historicalData.timestamps,
    datasets: [
      {
        label: 'CPU Usage',
        data: historicalData.cpu,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }
    ]
  }), [historicalData.cpu, historicalData.timestamps]);

  const memoryChartData = useMemo(() => ({
    labels: historicalData.timestamps,
    datasets: [
      {
        label: 'Memory Usage',
        data: historicalData.memory,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true
      }
    ]
  }), [historicalData.memory, historicalData.timestamps]);

  const diskChartData = useMemo(() => ({
    labels: historicalData.timestamps,
    datasets: [
      {
        label: 'Disk Usage',
        data: historicalData.disk,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true
      }
    ]
  }), [historicalData.disk, historicalData.timestamps]);

  const networkChartData = useMemo(() => ({
    labels: historicalData.timestamps,
    datasets: [
      {
        label: 'Network Sent',
        data: historicalData.network.map(n => n.sent),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true
      },
      {
        label: 'Network Received',
        data: historicalData.network.map(n => n.recv),
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        fill: true
      }
    ]
  }), [historicalData.network, historicalData.timestamps]);

  // Memoized values for display
  const cpuValue = useMemo(() => 
    `${systemStatus?.stats?.cpu?.toFixed(1) || '0'}%`, 
    [systemStatus?.stats?.cpu]
  );
  
  const memoryValue = useMemo(() => 
    `${((systemStatus?.stats?.memory_used || 0) / 1024).toFixed(1)}GB`, 
    [systemStatus?.stats?.memory_used]
  );
  
  const diskValue = useMemo(() => 
    `${((systemStatus?.stats?.disk_used || 0) / 1024).toFixed(1)}GB`, 
    [systemStatus?.stats?.disk_used]
  );
  
  const networkSentValue = useMemo(() => 
    `↑ ${(systemStatus?.stats?.network_sent || 0).toFixed(1)} MB/s`, 
    [systemStatus?.stats?.network_sent]
  );
  
  const networkRecvValue = useMemo(() => 
    `↓ ${(systemStatus?.stats?.network_recv || 0).toFixed(1)} MB/s`, 
    [systemStatus?.stats?.network_recv]
  );

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && 
          !e.target.closest('.z-[60]')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Safety check for active_apps array
  const activeApps = Array.isArray(systemStatus?.active_apps) ? systemStatus.active_apps : [];
  
  // Safety check for groups array
  const groups = Array.isArray(systemStatus?.groups) ? 
    systemStatus.groups.map(group => ({
      name: group.name || 'Unnamed Group',
      members: group.members?.length || 0
    })) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">Agent Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p className="text-lg font-medium">Error loading agent data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <AgentInfo systemStatus={systemStatus} agent={agent} />

                <div className="grid grid-cols-3 gap-4">
                  <StatCard 
                    title="Active Apps"
                    count={activeApps.length}
                    color="blue"
                    Icon={List}
                    onClick={() => setActiveAppsModalOpen(true)}
                  />

                  <StatCard 
                    title="Rules"
                    count={rules.length}
                    color="green"
                    Icon={Shield}
                    onClick={() => setRulesModalOpen(true)}
                  />

                  <StatCard 
                    title="Groups"
                    count={groups.length}
                    color="purple"
                    Icon={Users}
                    onClick={() => setGroupsModalOpen(true)}
                  />
                </div>
              </div>

              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* CPU Usage */}
                <MetricChart 
                  title="CPU Usage"
                  value={cpuValue}
                  color="blue"
                  chartData={cpuChartData}
                  chartOptions={chartOptions}
                  IconComponent={Cpu}
                />

                {/* Memory Usage */}
                <MetricChart 
                  title="Memory Usage"
                  value={memoryValue}
                  color="purple"
                  chartData={memoryChartData}
                  chartOptions={chartOptions}
                  IconComponent={MemoryStick}
                />

                {/* Disk Usage */}
                <MetricChart 
                  title="Disk Usage"
                  value={diskValue}
                  color="green"
                  chartData={diskChartData}
                  chartOptions={chartOptions}
                  IconComponent={HardDrive}
                />

                {/* Network Usage */}
                <NetworkChart
                  sentValue={networkSentValue}
                  recvValue={networkRecvValue}
                  chartData={networkChartData}
                  chartOptions={networkChartOptions}
                  IconComponent={Network}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Apps Modal */}
      <DetailModal
        title="Active Applications"
        items={activeApps}
        isOpen={activeAppsModalOpen}
        onClose={() => setActiveAppsModalOpen(false)}
      />

      {/* Rules Modal */}
      <DetailModal
        title="Applied Rules"
        items={rules || []}
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />

      {/* Groups Modal */}
      <DetailModal
        title="Available Groups"
        items={groups}
        isOpen={groupsModalOpen}
        onClose={() => setGroupsModalOpen(false)}
      />
    </div>
  );
};

export default AgentViewModal;