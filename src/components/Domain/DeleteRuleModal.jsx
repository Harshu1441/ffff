import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import base_Api from '../../../utils/baseApi.jsx';

const DeleteRuleModal = ({ 
  ruleToDelete, 
  setShowDeleteConfirm, 
  confirmDelete: parentConfirmDelete,
  isDeleting: parentIsDeleting,
  type // 'agent' or 'group'
}) => {
  console.log('DeleteRuleModal', ruleToDelete, type);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOption, setDeleteOption] = useState(null);



  // const agentName = ruleToDelete.agent_name || ruleToDelete.agents_in_group;
  const agentDeleteOptions = [
    {
      id: 1,
      label: 'Remove the entire rule for specified agents',
    
      api: async (agentName, ruleName) => {
        console.log('DeleteRuleModal......', agentName, type);
        const token = localStorage.getItem('token');
        return await axios.delete(`${base_Api}/remove_rule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
           
          },
          data: {
            agent_names: agentName,
            rule_name: ruleName
          }
        });
      }
    },
    {
      id: 2,
      label: 'Just remove the agent from the rule (keep rule for others)',
      api: async (agentNames, ruleName) => {
        const token = localStorage.getItem('token');
        return await axios.delete(`${base_Api}/remove_rule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
           
          },
          data: {
            agent_names: agentNames,
            rule_name: ruleName,
            remove_agent_only: true
          }
        });
      }
    },
    {
      id: 3,
      label: 'Remove all rules for these agents',
      api: async (agentNames) => {
        const token = localStorage.getItem('token');

        return await axios.delete(`${base_Api}/remove_all_rules_for_agent`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
           
          },
          data: {
            agent_names: agentNames
          }
        });
      }
    },
    {
      id: 4,
      label: 'Delete the entire rule (globally)',
      api: async (_, ruleName) => {
        const token = localStorage.getItem('token');
        return await axios.delete(`${base_Api}/delete_rule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
           
          },
          data: {
            rule_name: ruleName
          }
        });
      }
    }
  ];

  const groupDeleteOptions = [
    {
      id: 1,
      label: 'Remove all rules for an Group', // Fixed typo: "an group" -> "an agent"
      api: async (groupName) => {
        console.log('DeleteRuleModal......', groupName, type);
        const token = localStorage.getItem('token')
        return await axios.delete(`${base_Api}/remove_all_agent_rules`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            agent_name: groupName
          }
        });
      }
    },
    {
      id: 2,
      label: 'Remove all rules for a group',
      api: async (groupName) => {
        console.log('DeleteRuleModal......', groupName, type);
        const token = localStorage.getItem('token')
        return await axios.delete(`${base_Api}/remove_all_group_rules`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            group_name: groupName
          }
        });
      }
    },
    {
      id: 3,
      label: 'Remove a group from a specific rule',
      api: async (groupName, ruleName) => {
        const token = localStorage.getItem('token')
        return await axios.delete(`${base_Api}/remove_group_from_rule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            group_name: groupName,
            rule_name: ruleName
          }
        });
      }
    },
    {
      id: 4,
      label: 'Delete the entire rule (globally)',

      api: async (_, ruleName) => {
        const token = localStorage.getItem('token')
        return await axios.delete(`${base_Api}/delete_rule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            rule_name: ruleName
          }
        });
      }
    }
  ];

  const deleteOptions = type === 'agent' ? agentDeleteOptions : groupDeleteOptions;

  const handleDelete = async () => {
    if (!deleteOption || !ruleToDelete?.rule_name) return;

    setIsDeleting(true);
    try {
      const selectedOption = deleteOptions.find(opt => opt.id === deleteOption);
      
      if (type === 'agent') {
        // Ensure agent_name exists and convert to array if it's a string
        const agentNames = ruleToDelete.agents_in_group || ruleToDelete.agent_name;
        const formattedAgentNames = agentNames 
          ? (Array.isArray(agentNames) ? agentNames : [agentNames])
          : [];

        // Validate agent names exist
        if (formattedAgentNames.length === 0) {
          throw new Error('No agents specified. Please select at least one agent.');
        }

        // Handle different agent deletion options
        if (selectedOption.id === 3) {
          // Remove all rules for agents
          await selectedOption.api(formattedAgentNames);
        } else {
          // Other agent-related operations
          await selectedOption.api(formattedAgentNames, ruleToDelete.rule_name);
        }
      } else {
       
        // Group type handling remains the same
        if (selectedOption.id === 1) {
          await selectedOption.api(ruleToDelete.target);
        } else if (selectedOption.id === 2) {
          await selectedOption.api(ruleToDelete.target);
        } else if (selectedOption.id === 3) {
          await selectedOption.api(ruleToDelete.target, ruleToDelete.rule_name);
        } else {
          await selectedOption.api(null, ruleToDelete.rule_name);
        }
      }

      if (parentConfirmDelete) {
        await parentConfirmDelete();
      }
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting rule:', error.message);
      // You might want to show this error to the user
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const isProcessing = parentIsDeleting !== undefined ? parentIsDeleting : isDeleting;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start mb-4">
          <AlertCircle className="flex-shrink-0 text-red-500" size={24} />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Delete Rule</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete "{ruleToDelete?.rule_name || 'this rule'}"? 
              Please select an option:
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {deleteOptions.map(option => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                id={`option-${option.id}`}
                name="deleteOption"
                value={option.id}
                checked={deleteOption === option.id}
                onChange={() => setDeleteOption(option.id)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 disabled:opacity-50"
                disabled={isProcessing}
              />
              <label
                htmlFor={`option-${option.id}`}
                className="ml-2 text-sm text-gray-700"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white disabled:bg-red-400 disabled:cursor-not-allowed"
            disabled={isProcessing || !deleteOption}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRuleModal;