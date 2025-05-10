import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Users, Shield, Settings, Bell, Menu, X, ChevronDown, Activity, Circle } from 'lucide-react';
import AgentViewModal from './AgentViewModal/agentviewmodal';
import base_Api from '../../../utils/baseApi';
import AgentsTable from './agentsTable/agentsTable';

// Keep StatusDot as it's used in multiple places
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

// Keep StatCard as it's used in the dashboard
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

export default function AgentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
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

  // Fetch data effects
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
        if (!response.ok) throw new Error('Failed to fetch agents');
        
        const data = await response.json();
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
        if (!response.ok) throw new Error('Failed to fetch rules');
        
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
        if (!response.ok) throw new Error('Failed to fetch groups');
        
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

  // Calculate total groups
  const totalGroups = Object.keys(groups).length;

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 rounded-lg space-y-3 sm:space-y-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Agents</h1>
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
    </div>
  );
}