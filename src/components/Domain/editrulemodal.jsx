import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, ChevronUp, ChevronDown, Search, Plus, Check, Globe, Activity } from 'lucide-react';
import base_Api from '../../../utils/baseapi';
import Loader from '../../common/loader';
import SuccessModal from '../../eventmodal/successmodal';
import ErrorModal from '../../eventmodal/errormodal';

export default function EditRuleModal({
  isOpen,
  onClose,
  onRuleUpdated,
  rule,
}) {
  const [targetType, setTargetType] = useState(rule?.type === 'agent' ? 'agent' : 'group');
  const [agents, setAgents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [predefinedRules, setPredefinedRules] = useState([]);
  const [processInput, setProcessInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
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

  const safeSplit = (value) => {
    if (!value) return [];
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  };

  const [formData, setFormData] = useState({
    agent_names: rule?.type === 'agent' ? [rule.target] : [],
    group_names: rule?.type === 'group' ? [rule.target] : [],
    rule_name: rule?.rule_name || '',
    new_rule_name: rule?.rule_name || '',
    domains: safeSplit(rule?.domains),
    processes: safeSplit(rule?.processes),
    predefined_categories: rule?.predefined_categories || [],
    mode: rule?.mode || 'block',
    priority: rule?.priority || '',
    type: rule?.type || ''
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        agent_names: rule.type === 'agent' ? [rule.target] : [],
        group_names: rule.type === 'group' ? [rule.target] : [],
        rule_name: rule.rule_name || '',
        new_rule_name: rule.rule_name || '',
        domains: safeSplit(rule.domains),
        processes: safeSplit(rule.processes),
        predefined_categories: rule.predefined_categories || [],
        mode: rule.mode || 'block',
        priority: rule.priority || '',
        type: rule.type || ''
      });
      setTargetType(rule.type === 'agent' ? 'agent' : 'group');
    }
  }, [rule]);

  const addDomain = () => {
    if (domainInput.trim()) {
      setFormData(prev => ({
        ...prev,
        domains: [...prev.domains, domainInput.trim()]
      }));
      setDomainInput('');
    }
  };

  const addProcess = () => {
    if (processInput.trim()) {
      setFormData(prev => ({
        ...prev,
        processes: [...prev.processes, processInput.trim()]
      }));
      setProcessInput('');
    }
  };

  const handleKeyDown = (e, addFunction) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFunction();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleItem = (field, item) => {
    setFormData(prev => {
      const currentItems = prev[field];
      if (currentItems.includes(item)) {
        return {
          ...prev,
          [field]: currentItems.filter(i => i !== item)
        };
      }
      return {
        ...prev,
        [field]: [...currentItems, item]
      };
    });
  };

  const removeItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.rule_name) {
        throw new Error('Rule name is required');
      }

      if (targetType === 'agent' && !formData.agent_names.length) {
        throw new Error('Please select at least one agent');
      }

      if (targetType === 'group' && !formData.group_names.length) {
        throw new Error('Please select at least one group');
      }

      const token = localStorage.getItem('token');
      const updatedFormData = {
        ...formData,
        new_rule_name: formData.rule_name
      };

      const payload = {
        rule_name: updatedFormData.rule_name,
        new_rule_name: updatedFormData.new_rule_name,
        domains: updatedFormData.domains,
        mode: updatedFormData.mode,
        priority: updatedFormData.priority,
        predefined_categories: updatedFormData.predefined_categories,
        ...(targetType === 'agent' 
          ? { 
              agent_names: updatedFormData.agent_names,
              processes: updatedFormData.processes 
            }
          : { group_names: updatedFormData.group_names })
      };
      
      const response = await axios.put(`${base_Api}update_rule`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setSuccessModalConfig({
          show: true,
          message: 'Rule Updated Successfully!',
          subMessage: `Rule "${formData.rule_name}" has been updated.`,
        });

        if (onRuleUpdated) {
          await onRuleUpdated(formData);
        }

        setTimeout(() => {
          setSuccessModalConfig({ show: false, message: '', subMessage: '' });
          onClose();
        }, 2000);
      }
    } catch (error) {
      setErrorModalConfig({
        show: true,
        message: 'Failed to Update Rule',
        subMessage: error.response?.data?.message || error.message
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

        setAgents(agentRes.data || []);
        setGroups(Object.keys(groupRes.data || {}));
        setPredefinedRules(Object.keys(categoryRes.data?.predefined_rules || {}));
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

  useEffect(() => {
    if (targetType === 'agent') {
      setFormData(prev => ({ ...prev, group_names: [] }));
    } else {
      setFormData(prev => ({ ...prev, agent_names: [] }));
    }
  }, [targetType]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setAgentDropdownOpen(false);
        setGroupDropdownOpen(false);
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredAgents = agents.filter(agent =>
    agent.agent_id?.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredCategories = predefinedRules.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
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
          onClose={() => setSuccessModalConfig({ show: false, message: '', subMessage: '' })}
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
          <h2 className="text-2xl font-bold text-gray-800">Edit Rule</h2>
          <button 
            onClick={onClose} 
            aria-label="Close Modal"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
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
                  onClick={() => setTargetType('agent')}
                >
                  Apply to Agents
                </button>
                <button
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    targetType === 'group' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                  onClick={() => setTargetType('group')}
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
                                  onChange={() => {}}
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

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.priority || ''}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
              >
                <option value="">Select priority</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.mode || ''}
                onChange={(e) => handleInputChange('mode', e.target.value)}
              >
                <option value="">Select mode</option>
                <option value="allow">allow</option>
                <option value="block">block</option>
              </select>
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
                              toggleItem('predefined_categories', category);
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
            <Check className="h-4 w-4 mr-2" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}