import React, { useState, useRef, useEffect } from 'react';
import { Menu, Edit2, Trash2, Search, Plus, X, Layout, Check, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import base_Api from '../../../utils/baseapi2.jsx';

const AppGroup = () => {
  // State declarations
  const [appGroups, setAppGroups] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupError, setGroupError] = useState(null);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupError, setEditGroupError] = useState(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [editAgentSearchTerm, setEditAgentSearchTerm] = useState('');
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Fetch initial app groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${base_Api}app_list_groups `,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setAppGroups(response.data.groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${base_Api}app_agents `,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const formattedAgents = response.data.map((agent) => ({
          id: agent.agent_id,
          name: agent.agent_id,
          status: agent.status,
          os_name: agent.os_name,
          lastSeen: agent.last_seen
        }));
        setAgents(formattedAgents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
  }, []);

  const toggleAgentInDropdown = (agentId) => {
    setSelectedAgents((prevSelected) => {
      if (prevSelected.includes(agentId)) {
        return prevSelected.filter((id) => id !== agentId);
      } else {
        return [...prevSelected, agentId];
      }
    });
  };

  const handleCreateGroup = async () => {
    try {
      if (newGroupName.trim() && selectedAgents.length > 0) {
        setIsCreatingGroup(true);
        setGroupError(null);

        const payload = {
          group_name: newGroupName.trim(),
          agents: selectedAgents
        };
        const token = localStorage.getItem('token');
        const response = await axios.post(`${base_Api}app_create_group`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          // Refresh groups list
          const groupsResponse = await axios.get(`${base_Api}app_list_groups `, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setAppGroups(groupsResponse.data.groups);
          setNewGroupName('');
          setSelectedAgents([]);
          setShowCreateGroupModal(false);
          setAgentSearchTerm('');
        }
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setGroupError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupName) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${base_Api}delete_group`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
           
          },
          body: JSON.stringify({
            group_name: groupName
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newGroups = appGroups.filter(group => group.group_name !== groupName);
        setAppGroups(newGroups);
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group: ' + error.message);
      }
    }
  };

  const handleEditGroup = async () => {
    try {
      if (!editingGroup?.name?.trim() || !editingGroup?.selectedAgents?.length) {
        setEditGroupError('Group name and selected agents are required');
        return;
      }

      setIsEditingGroup(true);
      setEditGroupError(null);

      const payload = {
        group_name: editingGroup.name,
        agents: editingGroup.selectedAgents
      };
      const token = localStorage.getItem('token');

      const response = await axios.put(`${base_Api}app_update_group`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Refresh groups list
        const groupsResponse = await axios.get(`${base_Api}app_list_groups `, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setAppGroups(groupsResponse.data.groups);
        setShowEditGroupModal(false);
        setEditingGroup(null);
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setEditGroupError('Failed to update group: ' + error.message);
    } finally {
      setIsEditingGroup(false);
    }
  };

  const handleEditGroupClick = (groupName, groupAgents) => {
    setEditingGroup({
      name: groupName,
      originalName: groupName,
      selectedAgents: groupAgents || [] // Change selectedApps to selectedAgents
    });
    setShowEditGroupModal(true);
  };

  const removeAgentFromGroup = async (groupName, agentId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(`${base_Api}app_remove_agent_from_group `, {
        data: {
          group_name: groupName,
          agent_name: agentId
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Refresh groups list
        const groupsResponse = await axios.get(`${base_Api}app_list_groups `, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setAppGroups(groupsResponse.data.groups);
      }
    } catch (error) {
      console.error('Error removing agent from group:', error);
      alert('Failed to remove agent from group: ' + error.message);
    }
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Main Group Container */}
      <div className="bg-white rounded-lg shadow mb-6">
        {/* Header Section */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h2 className="text-base sm:text-lg font-medium">Application Groups</h2>
          <button 
            onClick={() => setShowCreateGroupModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Layout size={18} />
            <span>Create App Group</span>
          </button>
        </div>

        {/* Groups Display Section */}
        <div className="p-3 sm:p-4">
          {appGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {appGroups.map((group) => (
                <div key={group.group_name} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">{group.group_name}</h3>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1"
                        onClick={() => handleEditGroupClick(group.group_name, group.agents)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-1"
                        onClick={() => handleDeleteGroup(group.group_name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-2">
                    {group.agents.length} Agents
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {group.agents.map((agentId) => (
                      <div key={agentId} className="flex items-center gap-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded truncate max-w-[150px]">
                          {agentId}
                        </span>
                        <button
                          onClick={() => removeAgentFromGroup(group.group_name, agentId)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm sm:text-base">
              No application groups created yet. Create your first group to get started.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium">Create New App Group</h3>
              <button 
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setAgentSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-500 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Group Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>

              {/* Agent Selection Dropdown */}
              <div ref={dropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Agents
                </label>
                <div 
                  className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer text-sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="truncate">
                    {selectedAgents.length > 0 
                      ? `${selectedAgents.length} agent${selectedAgents.length !== 1 ? 's' : ''} selected` 
                      : 'Select agents...'}
                  </span>
                  {isDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[60vh] overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search agents..."
                          className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm"
                          value={agentSearchTerm}
                          onChange={(e) => setAgentSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Search size={16} className="absolute left-2.5 top-2 text-gray-400" />
                      </div>
                    </div>

                    {/* Agents List */}
                    <div className="overflow-y-auto max-h-48">
                      {filteredAgents.map(agent => (
                        <div 
                          key={agent.id}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgentInDropdown(agent.id);
                          }}
                        >
                          <div className={`w-4 h-4 mr-2 flex-shrink-0 rounded border ${
                            selectedAgents.includes(agent.id) 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedAgents.includes(agent.id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          <span className="flex-1">{agent.name}</span>
                          <span className='text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-gray-800 mr-2'>
                            {agent.os_name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            agent.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Agents Display */}
              {selectedAgents.length > 0 && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Agents
                  </label>
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {selectedAgents.map(agentId => {
                        const agent = agents.find(a => a.id === agentId);
                        return (
                          <div 
                            key={agentId} 
                            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm"
                          >
                            <span className="truncate max-w-[150px]">
                              {agent?.name}
                            </span>
                            <button 
                              className="ml-1 text-blue-600 hover:text-blue-800 p-1"
                              onClick={() => toggleAgentInDropdown(agentId)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {groupError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs sm:text-sm text-red-600">
                  {groupError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setAgentSearchTerm('');
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedAgents.length === 0 || isCreatingGroup}
                className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center text-sm ${
                  !newGroupName.trim() || selectedAgents.length === 0 || isCreatingGroup
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCreatingGroup ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditGroupModal && editingGroup && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium">Edit App Group</h3>
              <button 
                onClick={() => {
                  setShowEditGroupModal(false);
                  setEditingGroup(null);
                  setEditAgentSearchTerm('');
                  setEditDropdownOpen(false);
                }}
                className="text-gray-400 hover:text-gray-500 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Group Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({
                    ...editingGroup,
                    name: e.target.value
                  })}
                  placeholder="Enter group name"
                />
              </div>

              {/* Agent Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Agents
                </label>
                <div className="relative">
                  <div
                    className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer text-sm"
                    onClick={() => setEditDropdownOpen(!editDropdownOpen)}
                  >
                    <span className="truncate">
                      {editingGroup.selectedAgents.length > 0 
                        ? `${editingGroup.selectedAgents.length} agent${editingGroup.selectedAgents.length !== 1 ? 's' : ''} selected` 
                        : 'Select agents...'}
                    </span>
                    {editDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {editDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[60vh] overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search agents..."
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm"
                            value={editAgentSearchTerm}
                            onChange={(e) => setEditAgentSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Search size={16} className="absolute left-2.5 top-2 text-gray-400" />
                        </div>
                      </div>

                      {/* Agents List */}
                      <div className="overflow-y-auto max-h-48">
                        {agents.filter(agent => 
                          agent.name.toLowerCase().includes(editAgentSearchTerm.toLowerCase())
                        ).map(agent => (
                          <div 
                            key={agent.id}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              const isSelected = editingGroup.selectedAgents.includes(agent.id);
                              setEditingGroup({
                                ...editingGroup,
                                selectedAgents: isSelected
                                  ? editingGroup.selectedAgents.filter(id => id !== agent.id)
                                  : [...editingGroup.selectedAgents, agent.id]
                              });
                            }}
                          >
                            <div className={`w-4 h-4 mr-2 flex-shrink-0 rounded border ${
                              editingGroup.selectedAgents.includes(agent.id) 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {editingGroup.selectedAgents.includes(agent.id) && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                            <span className="flex-1">{agent.name}</span>
                            <span className='text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-gray-800 mr-2'>
                              {agent.os_name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              agent.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {agent.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Agents Display */}
                {editingGroup.selectedAgents.length > 0 && (
                  <div className="mt-2">
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {editingGroup.selectedAgents.map(agentId => {
                          const agent = agents.find(a => a.id === agentId);
                          return (
                            <div 
                              key={agentId} 
                              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm"
                            >
                              <span className="truncate max-w-[150px]">
                                {agent?.name}
                              </span>
                              <button 
                                className="ml-1 text-blue-600 hover:text-blue-800 p-1"
                                onClick={() => {
                                  setEditingGroup({
                                    ...editingGroup,
                                    selectedAgents: editingGroup.selectedAgents.filter(id => id !== agentId)
                                  });
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {editGroupError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs sm:text-sm text-red-600">
                  {editGroupError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  setShowEditGroupModal(false);
                  setEditingGroup(null);
                  setEditAgentSearchTerm('');
                  setEditDropdownOpen(false);
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditGroup}
                disabled={!editingGroup.name || editingGroup.selectedAgents.length === 0 || isEditingGroup}
                className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center text-sm ${
                  !editingGroup.name || editingGroup.selectedAgents.length === 0 || isEditingGroup
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditingGroup ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppGroup;