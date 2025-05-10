import React, { useState, useEffect } from 'react';
import BlockedTrafficTable from './logs/blockedTrafficTable';
import DnsQueriesTable from './logs/dnsQueriesTable';
import FirewallEventsTable from './logs/firewallEventsTable';
import NetworkConnectionsTable from './logs/networkConnectionsTable';
import base_Api from '../../utils/baseApi';

export default function Logs() {
  const [logQueue, setLogQueue] = useState({}); // Store logs with timestamps
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('blocked_traffic');
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const MAX_ENTRIES = 100; // Maximum entries per log type
  const FETCH_INTERVAL = 1000; // Fetch every 1 second
  const HOLD_DURATION = 30 * 1000; // Hold logs for 30 seconds

  // Fetch available agents
  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base_Api}/agents`,{
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to fetch agents');
    }
  };

  const fetchLogs = async () => {
    if (!selectedAgent || !showLogs) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base_Api}/get_logs/${selectedAgent}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      const currentTime = Date.now();
      const newLogEntries = {};

      Object.keys(data).forEach(key => {
        const limitedData = Array.isArray(data[key]) ? data[key].slice(0, MAX_ENTRIES) : [];
        newLogEntries[key] = limitedData.map(entry => ({
          data: entry,
          timestamp: currentTime // Timestamp when this log was fetched
        }));
      });

      // Merge new logs with existing queue, keeping only unexpired logs
      setLogQueue(prevQueue => {
        const updatedQueue = { ...prevQueue };
        Object.keys(newLogEntries).forEach(key => {
          // Filter out expired logs (older than 30 seconds)
          const existingLogs = (updatedQueue[key] || []).filter(
            entry => currentTime - entry.timestamp < HOLD_DURATION
          );
          // Add new logs
          updatedQueue[key] = [...existingLogs, ...newLogEntries[key]];
        });
        console.log('Updated log queue:', updatedQueue);
        return updatedQueue;
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch agents on component mount
    fetchAgents();
  }, []);

  useEffect(() => {
    if (!selectedAgent || !showLogs) return;

    // Initial fetch
    fetchLogs();

    // Fetch logs every 1 second
    const fetchIntervalId = setInterval(fetchLogs, FETCH_INTERVAL);

    // Clean up expired logs every 5 seconds (reduced frequency)
    const cleanupIntervalId = setInterval(() => {
      const currentTime = Date.now();
      setLogQueue(prevQueue => {
        const cleanedQueue = {};
        Object.keys(prevQueue).forEach(key => {
          cleanedQueue[key] = prevQueue[key].filter(
            entry => currentTime - entry.timestamp < HOLD_DURATION
          );
        });
        return Object.keys(cleanedQueue).length > 0 ? cleanedQueue : prevQueue;
      });
    }, 5000);

    // Cleanup intervals on unmount
    return () => {
      clearInterval(fetchIntervalId);
      clearInterval(cleanupIntervalId);
    };
  }, [selectedAgent, showLogs]);

  const handleSubmit = () => {
    setShowLogs(true);
    setLogQueue({}); // Clear existing logs
  };

  const handleStop = () => {
    setShowLogs(false);
    setLogQueue({}); // Clear existing logs
  };

  if (loading && Object.keys(logQueue).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-gray-700">Loading logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error loading logs</h3>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={fetchLogs}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Extract current data for display (strip timestamp info)
  const currentLogData = {};
  Object.keys(logQueue).forEach(key => {
    currentLogData[key] = logQueue[key].map(entry => entry.data);
  });

  const renderTabContent = () => {
    console.log('Current log data for render:', currentLogData);
    switch (activeTab) {
      case 'blocked_traffic':
        return <BlockedTrafficTable data={currentLogData["blocked_traffic.log"] || []} maxEntries={MAX_ENTRIES} />;
      case 'dns_queries':
        return <DnsQueriesTable data={currentLogData["dns_queries.log"] || []} maxEntries={MAX_ENTRIES} />;
      case 'firewall_events':
        return <FirewallEventsTable data={currentLogData["firewall_events.log"] || []} maxEntries={MAX_ENTRIES} />;
      case 'network_connections':
        return <NetworkConnectionsTable data={currentLogData["network_connections.log"] || []} maxEntries={MAX_ENTRIES} />;
      default:
        return <div>Select a log type</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Logs Viewer</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedAgent}
            onChange={(e) => {
              setSelectedAgent(e.target.value);
              setShowLogs(false); // Reset showLogs when agent changes
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an agent</option>
            {agents.map((agent) => (
              <option key={agent.agent_id} value={agent.agent_id}>
                {agent.agent_id} - {agent.os_name} ({agent.status})
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmit}
            disabled={!selectedAgent}
            className={`px-4 py-2 rounded-md ${
              selectedAgent
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            View Logs
          </button>
          {showLogs && (
            <>
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Stop Logs
              </button>
              {/* <span className="text-sm text-gray-500">
                {loading ? 'Updating...' : 'Last updated: ' + new Date().toLocaleTimeString()}
              </span> */}
            </>
          )}
        </div>
      </div>

      {!selectedAgent ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-medium text-gray-700">Please select an agent to view logs</div>
        </div>
      ) : !showLogs ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-medium text-gray-700">Click "View Logs" to start viewing logs</div>
        </div>
      ) : (
        <>
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <button
                className={`py-2 px-4 font-medium text-sm mr-8 border-b-2 ${
                  activeTab === 'blocked_traffic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('blocked_traffic')}
              >
                Blocked Traffic
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm mr-8 border-b-2 ${
                  activeTab === 'dns_queries'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('dns_queries')}
              >
                DNS Queries
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm mr-8 border-b-2 ${
                  activeTab === 'firewall_events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('firewall_events')}
              >
                Firewall Events
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'network_connections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('network_connections')}
              >
                Network Connections
              </button>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  );
}