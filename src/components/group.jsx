import React, { useState, useRef, useEffect } from 'react';
import { Menu, Edit2, Trash2, Search, Plus, X, Users, Check, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import base_Api from '../../utils/baseApi';

const Group = () => {
  // State declarations
  const [groups, setGroups] = useState({});
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
  
  const dropdownRef = useRef(null);

  // Constants
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${base_Api}groups`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroupError('Failed to fetch groups');
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${base_Api}agents`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const formattedAgents = response.data.map((agent) => ({
          id: agent.agent_id,
          name: agent.agent_id,
          status: agent.status,
          os_name:agent.os_name,
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
        return prevSelected.filter((id) => id !== agentId); // Deselect agent
      } else {
        return [...prevSelected, agentId]; // Select agent
      }
    });
  };
  

  const handleCreateGroup = async () => {
    try {
      if (newGroupName.trim() && selectedAgents.length > 0) {
        setIsCreatingGroup(true);
        setGroupError(null);
        const token = localStorage.getItem('token');
        const payload = {
          group_name: newGroupName.trim(),
          agent_names: selectedAgents
        };

        const response = await axios.post(
          `${base_Api}create_group`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          const groupsResponse = await axios.get(`${base_Api}groups`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setGroups(groupsResponse.data);
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
        const response = await axios.delete(`${base_Api}delete_group`, {
          data: { group_name: groupName },
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        });

        if (response.status === 200) {
          const groupsResponse = await axios.get(`${base_Api}groups`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setGroups(groupsResponse.data);
        }
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group');
      }
    }
  };

  const handleEditGroup = async (retryCount = 0) => {
    try {
      if (!editingGroup?.name?.trim() || !editingGroup?.selectedAgents?.length) {
        setEditGroupError('Group name and selected agents are required');
        return;
      }

      setIsEditingGroup(true);
      setEditGroupError(null);

      const payload = {
        old_group_name: editingGroup.originalName,
        new_group_name: editingGroup.name.trim(),
        agent_names: editingGroup.selectedAgents
      };
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'put',
        url: `${base_Api}update_group`,
        data: payload,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.status === 200) {
        const groupsResponse = await axios.get(`${base_Api}groups`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setGroups(groupsResponse.data);
        setShowEditGroupModal(false);
        setEditingGroup(null);
      }
    } catch (error) {
      console.error('Error updating group:', error);

      if (retryCount < MAX_RETRIES && error.message === 'Network Error') {
        await wait(RETRY_DELAY);
        return handleEditGroup(retryCount + 1);
      }

      setEditGroupError(
        error.response?.data?.message || 
        'Failed to update group'
      );
    } finally {
      setIsEditingGroup(false);
    }
  };

  const handleEditGroupClick = (groupName, groupAgents) => {
    setEditingGroup({
      name: groupName,
      originalName: groupName,
      selectedAgents: groupAgents || []
    });
    setShowEditGroupModal(true);
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
          <h2 className="text-base sm:text-lg font-medium">Group Management</h2>
          <button 
            onClick={() => setShowCreateGroupModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Users size={18} />
            <span>Create Group</span>
          </button>
        </div>

        {/* Groups Display Section */}
        <div className="p-3 sm:p-4">
          {Object.keys(groups).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(groups).map(([groupName, groupAgents]) => (
                <div key={groupName} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">{groupName}</h3>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1"
                        onClick={() => handleEditGroupClick(groupName, groupAgents)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-1"
                        onClick={() => handleDeleteGroup(groupName)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-2">
                    {groupAgents.length} Agents
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {groupAgents.map((agentId) => (
                      <span key={agentId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded truncate max-w-[150px]">
                        {agentId}
                      </span> 
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm sm:text-base">
              No groups created yet. Create your first group to get started.
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium">Create New Group</h3>
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
                          <span className='text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-gray-800'
                          >
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
                      {selectedAgents.map(agentId => (
                        <div 
                          key={agentId} 
                          className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm"
                        >
                          <span className="truncate max-w-[150px]">
                            {agents.find(a => a.id === agentId)?.name}
                          </span>
                          <button 
                            className="ml-1 text-blue-600 hover:text-blue-800 p-1"
                            onClick={() => toggleAgentInDropdown(agentId)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
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

      {/* Edit Modal - Similar responsive changes needed */}
      {showEditGroupModal && editingGroup && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium">Edit Group</h3>
              <button 
                onClick={() => {
                  setShowEditGroupModal(false);
                  setEditingGroup(null);
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
                <div className="p-3 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {agents.map(agent => (
                      <div 
                        key={agent.id}
                        onClick={() => {
                          const isSelected = editingGroup.selectedAgents.includes(agent.id);
                          setEditingGroup({
                            ...editingGroup,
                            selectedAgents: isSelected
                              ? editingGroup.selectedAgents.filter(id => id !== agent.id)
                              : [...editingGroup.selectedAgents, agent.id]
                          });
                        }}
                        className={`px-2 py-1 rounded cursor-pointer text-sm ${
                          editingGroup.selectedAgents.includes(agent.id)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {agent.name}
                        <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
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
              </div>

              {/* Error Message */}
              {editGroupError && (
                <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-1 text-sm text-red-700">
                        {editGroupError}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  setShowEditGroupModal(false);
                  setEditingGroup(null);
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

export default Group;
