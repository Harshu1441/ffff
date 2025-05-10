import React, { useState, useEffect } from 'react';
import { Activity, Shield, Eye } from 'lucide-react';
import base_Api from '../../../../utils/baseapi.jsx';
import AgentViewModal from '../AgentViewModal.jsx/AgentViewModal';

const AgentsTable = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [agentRules, setAgentRules] = useState({});

  // Fetch all agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${base_Api}agents`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
      });
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        setAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Fetch rules for a specific agent
  const fetchAgentRules = async (agentId) => {
    try {
      const response = await fetch(`${base_Api}get_rules?agent_name=${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rules');
      }
      const data = await response.json();
      setAgentRules(prev => ({
        ...prev,
        [agentId]: data.rules || []
      }));
    } catch (error) {
      console.error('Error fetching rules:', error);
      setAgentRules(prev => ({
        ...prev,
        [agentId]: []
      }));
    }
  };

  // Fetch rules for all agents
  useEffect(() => {
    agents.forEach(agent => {
      if (!agentRules[agent.agent_id]) {
        fetchAgentRules(agent.agent_id);
      }
    });
  }, [agents]);

  const handleViewAgent = (agent) => {
    // Fetch the latest rules for this agent
    fetchAgentRules(agent.agent_id);
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedAgent(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OS Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rules
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Seen
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent.agent_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{agent.agent_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      agent.status === 'active' 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-gray-900 capitalize">{agent.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {agent.os_name || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {agentRules[agent.agent_id]?.length || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(agent.last_seen)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewAgent(agent)}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agent View Modal */}
      {selectedAgent && (
        <AgentViewModal
          agent={selectedAgent}
          agentRules={agentRules[selectedAgent.agent_id] || []}
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AgentsTable;
