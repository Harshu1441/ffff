import React, { useState, useEffect, useRef } from 'react';
import { X, Circle, AlertCircle } from 'lucide-react';
import CPU from './graph/cpu';
import MemoryUse from './graph/memoryUse';
import Disk from './graph/disk';
import NetworkTraffic from './graph/networkTraffic';

const AgentViewModal = ({ agent, isOpen, onClose }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const initialFetchRef = useRef(true);

  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        // Only show loading on initial fetch
        if (initialFetchRef.current) {
          setLoading(true);
        }
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch('http://20.193.252.169:5000/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch agent status');
        }

        const data = await response.json();
        const matchingAgent = data.find(item => item.pc_name === agent.agent_id);
        
        if (matchingAgent) {
          setStatus(matchingAgent);
        } else {
          setError('No matching agent found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        if (initialFetchRef.current) {
          setLoading(false);
          initialFetchRef.current = false;
        }
      }
    };

    if (isOpen && agent) {
      fetchAgentStatus();
    }

    return () => {
      initialFetchRef.current = true;
    };
  }, [isOpen, agent]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Agent Status</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Agent Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Agent Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">PC Name</p>
                    <p className="font-medium">{status?.pc_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-medium">{status?.pc_ip}</p>
                  </div>
                </div>
              </div>

              {/* System Stats */}
              {/* <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">System Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">CPU Usage</p>
                    <p className="font-medium">{status?.stats?.cpu}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Memory Usage</p>
                    <p className="font-medium">
                      {status?.stats?.memory_used.toFixed(2)} / {status?.stats?.memory_total.toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Disk Usage</p>
                    <p className="font-medium">
                      {status?.stats?.disk_used} / {status?.stats?.disk_total.toFixed(2)} GB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Network Traffic</p>
                    <div>
                      <p className="text-sm">↑ {status?.stats?.network_sent.toFixed(2)} KB/s</p>
                      <p className="text-sm">↓ {status?.stats?.network_recv.toFixed(2)} KB/s</p>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* System Monitoring Graphs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <CPU initialData={status} />
                <MemoryUse initialData={status} />
                <Disk initialData={status} />
                <NetworkTraffic initialData={status} />
              </div>

              {/* Active Applications */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Active Applications</h4>
                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {status?.active_apps?.map((app, index) => (
                      <div 
                        key={index}
                        className="text-sm bg-white p-2 rounded border border-gray-100"
                      >
                        {app}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-right text-sm text-gray-500">
                Last updated: {new Date(status?.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentViewModal;
