import React, { useState, useEffect, useRef } from 'react';
import { Search, BarChart3, Users, Shield, Settings, Bell, Menu, X, ChevronDown, Activity, Circle, Eye, Edit, Trash2 } from 'lucide-react';
import AgentViewModal from './AgentViewModal.jsx/AgentViewModal';
import base_Api from '../../../utils/baseapi.jsx';
import AgentsTable from './AgentsTable.jsx/AgentsTable';

// Dummy data for demonstration
const agentData = [
  { id: 1, name: "Agent Smith", groups: 5, rules: 12, active: true, lastActive: "2 mins ago" },
  { id: 2, name: "Agent Johnson", groups: 3, rules: 8, active: true, lastActive: "Just now" },
  { id: 3, name: "Agent Brown", groups: 7, rules: 15, active: false, lastActive: "1 day ago" },
  { id: 4, name: "Agent Jones", groups: 2, rules: 5, active: true, lastActive: "5 mins ago" },
  { id: 5, name: "Agent Davis", groups: 4, rules: 9, active: false, lastActive: "3 days ago" },
  { id: 6, name: "Agent White", groups: 6, rules: 11, active: true, lastActive: "1 hour ago" },
  { id: 7, name: "Agent Thompson", groups: 1, rules: 3, active: false, lastActive: "1 week ago" },
  { id: 8, name: "Agent Garcia", groups: 8, rules: 17, active: true, lastActive: "30 mins ago" },
];

// Pulsing dot component for active status
const StatusDot = ({ active }) => {
  return (
    <div className="relative flex items-center">
      {active ? (
        <div className="relative">
          <Circle className="h-3 w-3 text-green-500 fill-green-500" />
          <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75 h-3 w-3" />
        </div>
      ) : (
        <Circle className="h-3 w-3 text-gray-400 fill-gray-400" />
      )}
      <span className="ml-2">{active ? 'Active' : 'Inactive'}</span>
    </div>
  );
};

// Card component
const StatCard = ({ title, value, icon, color }) => {
  const Icon = icon;
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Improved Modal component
const AgentDetailModal = ({ agent, isOpen, onClose }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    // Handle escape key press
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Handle outside click
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleOutsideClick);
      // Prevent body scrolling when modal is open
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'modal-appear 0.3s ease-out forwards'
        }}
      >
        <style jsx global>{`
          @keyframes modal-appear {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Agent Details</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 shadow-md">
              <span className="text-2xl text-blue-600 font-bold">{agent.name.charAt(0)}</span>
            </div>
            <div>
              <h4 className="text-lg font-bold">{agent.name}</h4>
              <p className="text-gray-500">ID: {agent.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-100 transition-colors shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <div className="mt-2">
                <StatusDot active={agent.active} />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-100 transition-colors shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Last Active</p>
              <p className="font-medium mt-2">{agent.lastActive}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h5 className="font-medium mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Groups ({agent.groups})
            </h5>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
              {Array.from({ length: Math.min(agent.groups, 5) }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="font-medium">Group {idx + 1}</span>
                  <span className="text-gray-500 text-sm bg-white px-2 py-1 rounded-full">{Math.floor(Math.random() * 20)} members</span>
                </div>
              ))}
              {agent.groups > 5 && (
                <div className="mt-3 text-blue-600 text-sm font-medium flex justify-center">
                  <button className="flex items-center hover:underline">
                    + {agent.groups - 5} more groups
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              Applied Rules ({agent.rules})
            </h5>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
              {Array.from({ length: Math.min(agent.rules, 5) }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <span className="font-medium">Rule {100 + idx}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    idx % 3 === 0 
                      ? 'bg-green-100 text-green-800' 
                      : idx % 3 === 1 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {idx % 3 === 0 ? 'Low' : idx % 3 === 1 ? 'Medium' : 'High'} Priority
                  </span>
                </div>
              ))}
              {agent.rules > 5 && (
                <div className="mt-3 text-blue-600 text-sm font-medium flex justify-center">
                  <button className="flex items-center hover:underline">
                    + {agent.rules - 5} more rules
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button 
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Agent
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ agent, isOpen, onClose, onConfirm }) => {
  const modalRef = useRef(null);
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Delete Agent</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete agent <span className="font-semibold">{agent?.name}</span>? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(agent.id)}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Agent Modal
const EditAgentModal = ({ agent, isOpen, onClose, onSave }) => {
  const modalRef = useRef(null);
  const [editedAgent, setEditedAgent] = useState(agent);
  
  useEffect(() => {
    setEditedAgent(agent);
  }, [agent]);
  
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAgent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedAgent);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Edit Agent</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={editedAgent?.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="active"
                value={editedAgent?.active}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Groups</label>
              <input
                type="number"
                name="groups"
                value={editedAgent?.groups || 0}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Rules</label>
              <input
                type="number"
                name="rules"
                value={editedAgent?.rules || 0}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// All Agents Modal component
const AllAgentsModal = ({ isOpen, onClose, agents, isLoading }) => {
  const modalRef = useRef(null);
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">All Agents</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No agents found
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent.agent_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{agent.agent_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDot active={agent.status === 'active'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(agent.last_seen).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
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

// Active Agents Modal component
const ActiveAgentsModal = ({ isOpen, onClose, agents, isLoading }) => {
  const modalRef = useRef(null);
  
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
  
  const activeAgents = agents.filter(agent => agent.status === 'active');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Active Agents</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : activeAgents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active agents found
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeAgents.map((agent) => (
                    <tr key={agent.agent_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{agent.agent_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(agent.last_seen).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
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

// Rules Modal component
const RulesModal = ({ isOpen, onClose, rules, isLoading }) => {
  const modalRef = useRef(null);
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">All Rules</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No rules found
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domains</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{rule.rule_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rule.mode === 'block' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {rule.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{rule.target}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {rule.domains.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {rule.processes.join(', ')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
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

// Groups Modal component
const GroupsModal = ({ isOpen, onClose, groups, isLoading }) => {
  const modalRef = useRef(null);
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">All Groups</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No groups found
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groups).map(([groupName, agents]) => (
                <div key={groupName} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">{groupName}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {agents.map((agent, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
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

export default function AgentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAllAgentsModalOpen, setIsAllAgentsModalOpen] = useState(false);
  const [isActiveAgentsModalOpen, setIsActiveAgentsModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [rules, setRules] = useState([]);
  const [groups, setGroups] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRulesLoading, setIsRulesLoading] = useState(true);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  
  // Fetch all agents when component mounts
  useEffect(() => {
    const fetchAllAgents = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${base_Api}agents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        // Format the agent data to include all necessary fields
        const formattedAgents = data.map(agent => ({
          agent_id: agent.agent_id,
          os_name: agent.os_name,
          status: agent.status,
          last_seen: agent.last_seen
        }));
        setAgents(formattedAgents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllAgents();
  }, []);

  // Fetch all rules when component mounts
  useEffect(() => {
    const fetchAllRules = async () => {
      try {
        setIsRulesLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${base_Api}list_all_rules`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch rules');
        }
        const data = await response.json();
        setRules(data.rules || []);
      } catch (error) {
        console.error('Error fetching rules:', error);
      } finally {
        setIsRulesLoading(false);
      }
    };
    
    fetchAllRules();
  }, []);

  // Fetch all groups when component mounts
  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        setIsGroupsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${base_Api}groups`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsGroupsLoading(false);
      }
    };
    
    fetchAllGroups();
  }, []);

  // Filter agents based on search term
  const filteredAgents = agentData.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteAgent = (agentId) => {
    setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
    setIsDeleteModalOpen(false);
  };

  const handleEditAgent = (editedAgent) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === editedAgent.id ? editedAgent : agent
      )
    );
  };

  const openDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (agent) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };

  const openViewModal = (agent) => {
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };

  // Calculate total number of groups
  const totalGroups = Object.keys(groups).length;

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 rounded-lg space-y-3 sm:space-y-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Agents</h1>
          <button className="sm:hidden text-gray-500 hover:text-gray-700">
            <Menu size={24} />
          </button>
        </header>
     
        {/* Dashboard content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div onClick={() => setIsAllAgentsModalOpen(true)} className="cursor-pointer">
                <StatCard 
                  title="Total Agents" 
                  value={isLoading ? "..." : agents.length} 
                  icon={Users} 
                  color="bg-blue-500" 
                />
              </div>
              <div onClick={() => setIsActiveAgentsModalOpen(true)} className="cursor-pointer">
                <StatCard 
                  title="Active Agents" 
                  value={isLoading ? "..." : agents.filter(a => a.status === 'active').length} 
                  icon={Activity} 
                  color="bg-green-500" 
                />
              </div>
              <div onClick={() => setIsGroupsModalOpen(true)} className="cursor-pointer">
                <StatCard 
                  title="Total Groups" 
                  value={isGroupsLoading ? "..." : totalGroups} 
                  icon={Users} 
                  color="bg-purple-500" 
                />
              </div>
              <div onClick={() => setIsRulesModalOpen(true)} className="cursor-pointer">
                <StatCard 
                  title="Total Rules" 
                  value={isRulesLoading ? "..." : rules.length} 
                  icon={Shield} 
                  color="bg-orange-500" 
                />
              </div>
            </div>
            
            {/* Search and filters */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-64 mb-4 md:mb-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>All Groups</option>
                    <option>Security</option>
                    <option>Operations</option>
                    <option>Support</option>
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Status: All</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Agent table */}
            <AgentsTable />
          </div>
        </main>
      </div>
      
      {/* Agent detail modal */}
      {selectedAgent && (
        <AgentDetailModal 
          agent={selectedAgent}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {selectedAgent && (
        <DeleteConfirmationModal 
          agent={selectedAgent}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAgent}
        />
      )}
      
      {/* Edit Agent Modal */}
      {selectedAgent && (
        <EditAgentModal 
          agent={selectedAgent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditAgent}
        />
      )}
      
      {/* Agent View Modal */}
      {selectedAgent && (
        <AgentViewModal
          agent={selectedAgent}
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
        />
      )}
      
      {/* All Agents Modal */}
      <AllAgentsModal
        isOpen={isAllAgentsModalOpen}
        onClose={() => setIsAllAgentsModalOpen(false)}
        agents={agents}
        isLoading={isLoading}
      />

      {/* Active Agents Modal */}
      <ActiveAgentsModal
        isOpen={isActiveAgentsModalOpen}
        onClose={() => setIsActiveAgentsModalOpen(false)}
        agents={agents}
        isLoading={isLoading}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={rules}
        isLoading={isRulesLoading}
      />

      {/* Groups Modal */}
      <GroupsModal
        isOpen={isGroupsModalOpen}
        onClose={() => setIsGroupsModalOpen(false)}
        groups={groups}
        isLoading={isGroupsLoading}
      />
    </div>
  );
}