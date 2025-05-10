import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, ChevronUp, ChevronDown, Search, Plus, Check, Globe, Activity } from 'lucide-react';
import base_Api from '../../../utils/baseApi';
import Loader from '../../comman/loader';
import SuccessModal from '../../eventmodal/successmodal';
import ErrorModal from '../../eventmodal/errormodal';

export default function AddRuleModal({
  isOpen,
  onClose,
  onRuleAdded,
}) {
  const [mode, setMode] = useState('');
  const [targetType, setTargetType] = useState('agent'); // 'agent' or 'group'
  const [agents, setAgents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [predefinedRules, setPredefinedRules] = useState({});
  const [priority, setPriority] = useState("");
  
  // State for dropdown search inputs
  const [agentSearch, setAgentSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  // State for dropdown visibility
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const priorityOptions = Array.from({length: 10}, (_, i) => (i + 1).toString());
 const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false); // Added for priority dropdown
  
 const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  // State for domains, processes, and categories inputs
  const [domainInput, setDomainInput] = useState('');
  const [processInput, setProcessInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const [formData, setFormData] = useState({
    agent_names: [],
    group_names: [],
    rule_name: '',
    domains: [],
    processes: [],
    predefined_categories: [],
    priority: "",
    mode: "",
    
  });

  // For displaying associated domains with selected categories
  const [selectedCategoryDomains, setSelectedCategoryDomains] = useState({});

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
   }); // Add this state




   // Add this useEffect to fetch active apps
  //  useEffect(() => {
  //    const fetchActiveApps = async () => {
  //     if (!formData.agent_names?.length || targetType !== 'agent' || !agents.length) {
  //       setActiveApps([]);
  //       return;
  //     }
      
   
  //      try {
  //        const uniqueApps = new Set();
  //        for (const agentId of formData.agent_names) {
  //          const agent = agents.find(a => a.agent_id === agentId);
  //          if (agent) {
  //            const response = await axios.get(`${base_Api}status?agent_id=${agentId}&pc_ip=${agent.pc_ip}`);
  //            const data = response.data;
  //            if (Array.isArray(data)) {
  //              data.forEach(item => {
  //                if (item.active_apps) {
  //                  item.active_apps.forEach(app => uniqueApps.add(app));
  //                }
  //              });
  //            } else if (data.active_apps) {
  //              data.active_apps.forEach(app => uniqueApps.add(app));
  //            }
  //          }
  //        }
  //        setActiveApps([...uniqueApps]);
  //      } catch (error) {
  //        console.error('Error fetching active apps:', error);
  //        setActiveApps([]);
  //        setErrorModalConfig({
  //          show: true,
  //          message: 'Failed to Fetch Active Apps',
  //          subMessage: error.response?.data?.message || error.message,
  //        });
  //      }
  //    };
  //    fetchActiveApps();
  //  }, [formData.agent_names, agents, targetType]);
   


  



  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle target type between agent and group
  const toggleTargetType = (type) => {
    setTargetType(type);
    // Clear the other type's selections
    if (type === 'agent') {
      setFormData(prev => ({ ...prev, group_names: [] }));
    } else {
      setFormData(prev => ({ ...prev, agent_names: [] }));
    }
  };
  
  // Add domain to the domains array
  const addDomain = () => {
    if (domainInput.trim()) {
      setFormData(prev => ({
        ...prev,
        domains: [...prev.domains, domainInput.trim()]
      }));
      setDomainInput('');
    }
  };

  // Add process to the processes array
  const addProcess = () => {
    if (processInput.trim()) {
      setFormData(prev => ({
        ...prev,
        processes: [...prev.processes, processInput.trim()]
      }));
      setProcessInput('');
    }
  };

  // Add custom category to the predefined_categories array
  const addCategory = () => {
    if (categoryInput.trim() && !formData.predefined_categories.includes(categoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        predefined_categories: [...prev.predefined_categories, categoryInput.trim()]
      }));
      setCategoryInput('');
    }
  };

  // Select existing category from dropdown
  const selectCategory = (category) => {
    if (!formData.predefined_categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        predefined_categories: [...prev.predefined_categories, category]
      }));
      
      // Update the selected category domains mapping
      if (predefinedRules[category]) {
        setSelectedCategoryDomains(prev => ({
          ...prev,
          [category]: predefinedRules[category]
        }));
      }
    }
  };

  // Handle enter key for inputs
  const handleKeyDown = (e, addFunction) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFunction();
    }
  };
  
  // Toggle item selection in respective array
  const toggleItem = (field, item) => {
    setFormData(prev => {
      if (prev[field].includes(item)) {
        return {
          ...prev,
          [field]: prev[field].filter(i => i !== item)
        };
      } else {
        return {
          ...prev,
          [field]: [...prev[field], item]
        };
      }
    });
  };
  
  // Remove item from array
  const removeItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
    
    // Also remove associated domains from the display if removing a category
    if (field === 'predefined_categories') {
      setSelectedCategoryDomains(prev => {
        const newDomains = { ...prev };
        delete newDomains[item];
        return newDomains;
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const payload = {
      rule_name: formData.rule_name,
      agent_names: targetType === 'agent' ? formData.agent_names : [],
      group_names: targetType === 'group' ? formData.group_names : [],
      domains: formData.domains,
      processes: formData.processes,
      predefined_categories: formData.predefined_categories,
      priority: parseInt(formData.priority, 10),
      mode: formData.mode,
    };

    try {
      await axios.post(`${base_Api}add_rule`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccessModalConfig({
        show: true,
        message: 'Rule Added Successfully!',
        subMessage: `Rule "${formData.rule_name}" has been created.`,
      });

      // Reset form
      setFormData({
        agent_names: [],
        group_names: [],
        rule_name: '',
        domains: [],
        processes: [],
        predefined_categories: [],
        priority: "",
        mode: "", 
      });
      setSelectedCategoryDomains({});
      setTargetType('agent');
      setMode('agent');
      
      // Close the modal after success message
      setTimeout(() => {
        setSuccessModalConfig({ show: false, message: '', subMessage: '' });
        onRuleAdded?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error adding rule:', error);
      setErrorModalConfig({
        show: true,
        message: 'Failed to Add Rule',
        subMessage: error.response?.data?.message || error.message || 'An error occurred while adding the rule.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [agentRes, groupRes, categoryRes] = await Promise.all([
          axios.get(`${base_Api}agents`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          axios.get(`${base_Api}groups`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          axios.get(`${base_Api}get_predefined_rules`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        setAgents(agentRes.data);
        setGroups(Object.keys(groupRes.data));
        
        if (categoryRes.data && categoryRes.data.predefined_rules) {
          setPredefinedRules(categoryRes.data.predefined_rules);
        }
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        setErrorModalConfig({
          show: true,
          message: 'Failed to Load Data',
          subMessage: err.response?.data?.message || err.message
        });
      }
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setAgentDropdownOpen(false);
        setGroupDropdownOpen(false);
        setCategoryDropdownOpen(false);
        setPriorityDropdownOpen(false); // Added for priority dropdown
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter functions for search
  const filteredAgents = agents.filter(agent => 
    agent.agent_id.toLowerCase().includes(agentSearch.toLowerCase())
  );
  
  const filteredGroups = groups.filter(group => 
    group.toLowerCase().includes(groupSearch.toLowerCase())
  );
  
  const categoryKeys = Object.keys(predefinedRules);
  const filteredCategories = categoryKeys.filter(category => 
    category.toLowerCase().includes(categorySearch.toLowerCase()) &&
    !formData.predefined_categories.includes(category)
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
      <h2 className="text-2xl font-bold text-gray-800">Add Rule</h2>
      <button 
        onClick={onClose} 
        aria-label="Close Modal"
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="text-gray-500 hover:text-gray-700" />
      </button>
    </div>

    <div className="overflow-y-auto flex-grow">
      <div className="mb-6 flex gap-3">
        <button
          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
            mode === 'agent' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setMode('agent')}
        >
          Apply to Target
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Rule Name</label>
          <input
            className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter rule name"
            value={formData.rule_name}
            onChange={(e) => handleInputChange('rule_name', e.target.value)}
          />
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Target Type</div>
          <div className="flex gap-3">
            <button
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                targetType === 'agent' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              onClick={() => toggleTargetType('agent')}
            >
              Apply to Agents
            </button>
            <button
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                targetType === 'group' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              onClick={() => toggleTargetType('group')}
            >
              Apply to Groups
            </button>
          </div>
        </div>

        {targetType === 'agent' && (
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
                            formData.agent_names.includes(agent.agent_id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem('agent_names', agent.agent_id);
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="checkbox"
                              checked={formData.agent_names.includes(agent.agent_id)}
                              onChange={() => toggleItem('agent_names', agent.agent_id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{agent.agent_id}</span>
                              <span className="text-sm text-gray-500">{agent.status}</span>
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
                      onClick={() => removeItem('agent_names', agent)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {targetType === 'group' && (
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
                      filteredGroups.map((group, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                            formData.group_names.includes(group) ? 'bg-blue-50' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem('group_names', group);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.group_names.includes(group)}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded mr-3"
                          />
                          <span>{group}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {formData.group_names.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.group_names.map((group, idx) => (
                  <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {group}
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      onClick={() => removeItem('group_names', group)}
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
          <label className="text-sm font-medium text-gray-700 mb-2">Domains</label>
          <div className="flex">
            <div className="relative flex-grow">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                className="border border-gray-300 p-3 pl-10 rounded-lg flex-grow w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add domain and press Enter"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addDomain)}
              />
            </div>
            <button 
              className="ml-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
              onClick={addDomain}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </button>
          </div>
          {formData.domains.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.domains.map((domain, idx) => (
                <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {domain}
                  <button
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    onClick={() => removeItem('domains', domain)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
                onKeyDown={(e) => handleKeyDown(e, addProcess)}
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
              {formData.processes.map((process, idx) => (
                <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {process}
                  <button
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    onClick={() => removeItem('processes', process)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

<div className="flex flex-col dropdown-container relative">
  <label className="text-sm font-medium text-gray-700 mb-2">Priority</label>
  <div className="flex flex-col">
    <div 
      className="border border-gray-300 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400 transition-colors"
      onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
    >
      <div className="flex-1 truncate">
        {formData.priority || 'Select priority'}
      </div>
      <div className="text-gray-500">
        {priorityDropdownOpen ? 
          <ChevronUp className="h-5 w-5" /> : 
          <ChevronDown className="h-5 w-5" />
        }
      </div>
    </div>
    
    {priorityDropdownOpen && (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
        <div>
          {priorityOptions.map((option, idx) => (
            <div 
              key={idx} 
              className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                formData.priority === option ? 'bg-blue-50' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleInputChange('priority', option);
                setPriorityDropdownOpen(false);
              }}
            >
              <span>{option}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>


<div className="flex flex-col dropdown-container relative">
  <label className="text-sm font-medium text-gray-700 mb-2">Mode</label>
  <div className="flex flex-col">
    <div 
      className="border border-gray-300 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400 transition-colors"
      onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
    >
      <div className="flex-1 truncate">
        {formData.mode || 'Select mode'}
      </div>
      <div className="text-gray-500">
        {modeDropdownOpen ? 
          <ChevronUp className="h-5 w-5" /> : 
          <ChevronDown className="h-5 w-5" />
        }
      </div>
    </div>
    
    {modeDropdownOpen && (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
        <div>
          {['allow', 'block'].map((option, idx) => (
            <div 
              key={idx} 
              className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                formData.mode === option ? 'bg-blue-50' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleInputChange('mode', option);
                setModeDropdownOpen(false);
              }}
            >
              <span>{option}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Predefined Categories</label>
          
          <div className="flex flex-col dropdown-container relative mb-3">
            <div 
              className="border border-gray-300 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              <div className="flex-1 truncate">
                {formData.predefined_categories.length === 0 
                  ? 'Select predefined categories' 
                  : `${formData.predefined_categories.length} category(s) selected`}
              </div>
              <div className="text-gray-500">
                {categoryDropdownOpen ? 
                  <ChevronUp className="h-5 w-5" /> : 
                  <ChevronDown className="h-5 w-5" />
                }
              </div>
            </div>
            
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div className="p-3 border-b sticky top-0 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div>
                  {filteredCategories.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No categories found</div>
                  ) : (
                    filteredCategories.map((category, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                          formData.predefined_categories.includes(category) ? 'bg-blue-50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCategory(category);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.predefined_categories.includes(category)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded mr-3"
                        />
                        <span>{category}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {formData.predefined_categories.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3 text-gray-700">Selected Categories</h3>
              <div className="space-y-3">
                {formData.predefined_categories.map((category, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-3">
                      <span className="font-medium text-blue-800">{category}</span>
                      <button
                        className="text-gray-500 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 rounded-full"
                        onClick={() => removeItem('predefined_categories', category)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {selectedCategoryDomains[category] && selectedCategoryDomains[category].length > 0 && (
                      <div className="p-3">
                        <p className="text-sm text-gray-600 mb-2">Associated domains:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategoryDomains[category].map((domain, domainIdx) => (
                            <div key={domainIdx} className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full">
                              {domain}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
        onClick={handleSubmit} 
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
      >
        <Check className="h-4 w-4 mr-2" /> Add Rule
      </button>
    </div>
  </div>
</div>


);
}