import React, { useState, useEffect } from 'react';
import { X, Search, Check, ChevronUp, ChevronDown, Activity, Plus } from 'lucide-react';
import axios from 'axios';
import base_Api from '../../../utils/baseapi';
import Loader from '../../common/loader';
import SuccessModal from '../../eventmodal/successmodal';
import ErrorModal from '../../eventmodal/errormodal';

export default function AddAppRuleModal({
  isOpen,
  onClose,
  onRuleAdded,
}) {
  const [formData, setFormData] = useState({
    rule_name: '',
    agent_names: [],
    group_names: [],
    processes: [],
    mode: 'block'
  });

  // UI state
  const [agents, setAgents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [targetType, setTargetType] = useState('agent');
  const [processInput, setProcessInput] = useState('');
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({
    show: false,
    message: '',
    subMessage: ''
  });
  const [errorModalConfig, setErrorModalConfig] = useState({
    show: false,
    message: '',
    subMessage: ''
  });
  const [error, setError] = useState(null);

  // Fetch agents and groups
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const [agentsRes, groupsRes] = await Promise.all([
          axios.get(`${base_Api}app_agents `,{
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          axios.get(`${base_Api}app_list_groups `, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          })
        ]);

        // Format agents data similar to appGroup.jsx
        const formattedAgents = (agentsRes.data || []).map(agent => ({
          id: agent.agent_id,
          name: agent.agent_id,
          status: agent.status,
          os_name: agent.os_name,
          lastSeen: agent.last_seen
        }));
        setAgents(formattedAgents);

        const formattedGroups = (groupsRes.data?.groups || []).map(group => ({
          name: group.group_name,
          agents: group.agents || []
        }));
        setGroups(formattedGroups);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch agents and groups');
        setAgents([]);
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle agent selection
  const toggleAgent = (agentId) => {
    setFormData(prev => ({
      ...prev,
      agent_names: prev.agent_names.includes(agentId)
        ? prev.agent_names.filter(id => id !== agentId)
        : [...prev.agent_names, agentId]
    }));
  };

  // Toggle group selection
  const toggleGroup = (groupName) => {
    setFormData(prev => ({
      ...prev,
      group_names: prev.group_names.includes(groupName)
        ? prev.group_names.filter(name => name !== groupName)
        : [...prev.group_names, groupName]
    }));
  };

  // Add process
  const addProcess = () => {
    if (processInput.trim()) {
      setFormData(prev => ({
        ...prev,
        processes: [...prev.processes, processInput.trim()]
      }));
      setProcessInput('');
    }
  };

  // Remove process
  const removeProcess = (process) => {
    setFormData(prev => ({
      ...prev,
      processes: prev.processes.filter(p => p !== process)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
   
    try {
      const token = localStorage.getItem('token');
      // Validation
      if (!formData.rule_name || !formData.processes.length) {
        setErrorModalConfig({
          show: true,
          message: 'Validation Error',
          subMessage: 'Rule name and at least one process are required',
        });
        return;
      }

      const payload = {
        rule_name: formData.rule_name,
        processes: formData.processes,
        mode: formData.mode,
        type: targetType,
      };

      if (targetType === 'agent') {
        if (!formData.agent_names.length) {
          setErrorModalConfig({
            show: true,
            message: 'Validation Error',
            subMessage: 'Please select at least one agent',
          });
          return;
        }
        payload.agent_names = formData.agent_names;
      } else {
        if (!formData.group_names.length) {
          setErrorModalConfig({
            show: true,
            message: 'Validation Error',
            subMessage: 'Please select at least one group',
          });
          return;
        }
        payload.group_names = formData.group_names;
      }

      const response = await axios.post(`${base_Api}app_add_app_rule `, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        const newRule = {
          id: response.data.rule_id || Date.now(), // Use API-provided ID or fallback
          rule_name: formData.rule_name,
          type: targetType,
          target: targetType === 'agent' ? formData.agent_names.join(', ') : formData.group_names.join(', '),
          processes: formData.processes,
          mode: formData.mode,
        };

        // Notify parent component
        if (onRuleAdded) {
          await onRuleAdded(newRule);
        }

        // Show success modal
        setSuccessModalConfig({
          show: true,
          message: 'Rule Added Successfully!',
          subMessage: `Rule "${formData.rule_name}" has been created.`,
        });

        // Reset form
        setFormData({
          rule_name: '',
          agent_names: [],
          group_names: [],
          processes: [],
          mode: 'block',
        });

        // Close success modal and modal after delay
        setTimeout(() => {
          setSuccessModalConfig({ show: false, message: '', subMessage: '' });
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding app rule:', error);
      setErrorModalConfig({
        show: true,
        message: 'Failed to Add Rule',
        subMessage: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter agents based on search
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes((agentSearch || '').toLowerCase())
  );

  const filteredGroups = (groups || []).filter(group => 
    group?.name?.toLowerCase().includes((groupSearch || '').toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50 flex justify-center items-center z-50">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader />
        </div>
      )}
      
      {successModalConfig.show && (
        <SuccessModal
          message={successModalConfig.message}
          subMessage={successModalConfig.subMessage}
          onClose={() => {
            setSuccessModalConfig({ show: false, message: '', subMessage: '' });
            onClose();
          }}
          autoCloseDelay={2000}
        />
      )}
      
      {errorModalConfig.show && (
        <ErrorModal
          message={errorModalConfig.message}
          subMessage={errorModalConfig.subMessage}
          onClose={() => setErrorModalConfig({ show: false, message: '', subMessage: '' })}
          autoCloseDelay={3000}
        />
      )}
      
      <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] flex flex-col border border-gray-200">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Add Application Rule</h2>
          <button 
            onClick={onClose} 
            aria-label="Close Modal"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rule Name</label>
              <input
                type="text"
                required
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.rule_name}
                onChange={(e) => handleInputChange('rule_name', e.target.value)}
                placeholder="Enter rule name"
              />
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Target Type</div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    targetType === 'agent' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                  onClick={() => {
                    setTargetType('agent');
                    setFormData(prev => ({ ...prev, group_names: [], agent_names: [] }));
                  }}
                >
                  Apply to Agents
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    targetType === 'group' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                  onClick={() => {
                    setTargetType('group');
                    setFormData(prev => ({ ...prev, group_names: [], agent_names: [] }));
                  }}
                >
                  Apply to Groups
                </button>
              </div>
            </div>

            {targetType === 'agent' ? (
               <div className="flex flex-col dropdown-container relative">
               <label className="text-sm font-medium text-gray-700 mb-2">Select Agents</label>
               <div className="flex flex-col">
                 <div 
                   className="border border-gray-300 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400 transition-colors"
                   onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
                 >
                   <div className="flex-1 truncate">
                     {formData.agent_names.length === 0 
                       ? 'Select agents' 
                       : `${formData.agent_names.length} agent(s) selected`}
                   </div>
                   <div className="text-gray-500">
                     {agentDropdownOpen ? 
                       <ChevronUp className="h-5 w-5" /> : 
                       <ChevronDown className="h-5 w-5" />
                     }
                   </div>
                 </div>
                 
                 {agentDropdownOpen && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                     <div className="p-3 border-b sticky top-0 bg-white">
                       <div className="relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                         <input
                           className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Search agents..."
                           value={agentSearch}
                           onChange={(e) => setAgentSearch(e.target.value)}
                           onClick={(e) => e.stopPropagation()}
                         />
                       </div>
                     </div>
                     <div>
                       {filteredAgents.length === 0 ? (
                         <div className="p-4 text-gray-500 text-center">No agents found</div>
                       ) : (
                         filteredAgents.map((agent, idx) => (
                           <div 
                             key={idx} 
                             className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                               formData.agent_names.includes(agent.id) ? 'bg-blue-50' : ''
                             }`}
                             onClick={(e) => {
                               e.stopPropagation();
                               toggleAgent(agent.id);
                             }}
                           >
                             <div className="flex items-center gap-2 w-full">
                               <input
                                 type="checkbox"
                                 checked={formData.agent_names.includes(agent.id)}
                                 onChange={() => toggleAgent(agent.id)}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                               />
                               <div className="flex flex-col">
                                 <span className="font-medium">{agent.name}</span>
                                 <div className="flex items-center gap-2">
                                   <span className="text-sm text-gray-500">{agent.status}</span>
                                   <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-gray-800">
                                     {agent.os_name}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   </div>
                 )}
               </div>
               {formData.agent_names.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-3">
                   {formData.agent_names.map((agent, idx) => (
                     <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                       {agent}
                       <button
                         className="ml-2 text-blue-500 hover:text-blue-700"
                         onClick={(e) => {
                           e.stopPropagation();
                           removeProcess(agent);
                         }}
                       >
                         <X className="h-3 w-3" />
                       </button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
            ) : (
              <div className="flex flex-col dropdown-container relative">
                <label className="text-sm font-medium text-gray-700 mb-2">Select Groups</label>
                <div className="flex flex-col">
                  <div 
                    className="border border-gray-300 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
                  >
                    <div className="flex-1 truncate">
                      {formData.group_names.length === 0 
                        ? 'Select groups' 
                        : `${formData.group_names.length} group(s) selected`}
                    </div>
                    <div className="text-gray-500">
                      {groupDropdownOpen ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </div>
                  </div>
                  
                  {groupDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="p-3 border-b sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search groups..."
                            value={groupSearch}
                            onChange={(e) => setGroupSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div>
                        {filteredGroups.length === 0 ? (
                          <div className="p-4 text-gray-500 text-center">No groups found</div>
                        ) : (
                          filteredGroups.map((group) => (
                            <div 
                              key={group.name} 
                              className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                                formData.group_names.includes(group.name) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleGroup(group.name)}
                            >
                              <input
                                type="checkbox"
                                checked={formData.group_names.includes(group.name)}
                                onChange={() => {}}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded mr-3"
                              />
                              <span className="flex-1">{group.name}</span>
                              <span className="text-xs text-gray-500">
                                ({group.agents.length} agents)
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {formData.group_names.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.group_names.map((groupName) => (
                      <div key={groupName} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {groupName}
                        <button
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          onClick={() => toggleGroup(groupName)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Processes</label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    className="border border-gray-300 p-3 pl-10 rounded-lg flex-grow w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add process and press Enter"
                    value={processInput}
                    onChange={(e) => setProcessInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProcess())}
                  />
                </div>
                <button 
                  className="ml-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                  onClick={addProcess}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
              {formData.processes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.processes.map((process, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {process}
                      <button
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProcess(process);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="block"
                    checked={formData.mode === 'block'}
                    onChange={(e) => handleInputChange('mode', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">Block</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="allow"
                    checked={formData.mode === 'allow'}
                    onChange={(e) => handleInputChange('mode', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">Allow</span>
                </label>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end gap-3 shrink-0">
              <button 
                onClick={onClose} 
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
              >
                <Check className="h-4 w-4 mr-2" /> Add Rule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}