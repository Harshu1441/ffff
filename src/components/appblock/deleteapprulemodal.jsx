import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import base_Api from '../../../utils/baseapi2.jsx';

const DeleteAppRuleModal = ({ 
  ruleToDelete, 
  setShowDeleteConfirm, 
  confirmDelete,
  isDeleting 
}) => {
  const [deleteOption, setDeleteOption] = useState(null);
  const [error, setError] = useState(null);

  const agentDeleteOptions = [
    {
      id: 1,
      label: 'Remove rule for this agent',
    },
    {
      id: 2,
      label: 'Remove agent from rule',
    },
    {
      id: 3,
      label: 'Remove all rules for this agent',
    },
    {
      id: 4,
      label: 'Delete entire rule',
    }
  ];

  const groupDeleteOptions = [
    {
      id: 1,
      label: 'Delete entire rule',
      description: 'Completely removes this rule from the system'
    },
    {
      id: 2,
      label: 'Remove group from rule',
      description: 'Keeps the rule but removes this group from it'
    },
    {
      id: 3,
      label: 'Delete all rules for this group',
      description: 'Removes all rules associated with this group'
    }
  ];

  const deleteOptions = ruleToDelete?.type === 'group' ? groupDeleteOptions : agentDeleteOptions;

  const handleDelete = async () => {
    if (!deleteOption) return;
    
    try {
      let endpoint = '';
      let payload = {};
      
      // Debug log to check received props
      console.log('Rule to delete:', ruleToDelete);

      if (!ruleToDelete?.rule_name || !ruleToDelete?.type) {
        throw new Error('Missing required rule information');
      }

      if (ruleToDelete.type === 'group') {
        // Handle group-specific delete options
        switch (Number(deleteOption)) {
          case 1: // Delete entire rule
          const token = localStorage.getItem('token')
            endpoint = `${base_Api}app_delete_rule`,{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            };
            payload = {
              rule_name: ruleToDelete.rule_name
            };
            break;
            
          case 2: // Remove group from rule
            endpoint = `${base_Api}app_remove_group_from_rule`,{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            };
            payload = {
              rule_name: ruleToDelete.rule_name,
              group_names: [ruleToDelete.target] // Assuming target contains the group name
            };
            break;
            
          case 3: // Delete all rules for this group
            endpoint = `${base_Api}app_delete_all_rules_for_group`,{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            };
            payload = {
              group_name: ruleToDelete.target
            };
            break;
        }
      } else {
        // Handle agent-specific delete options (existing code)
        switch (Number(deleteOption)) {
          case 1:
            endpoint = `${base_Api}app_delete_app_rule`,{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            };
            payload = {
              rule_name: ruleToDelete.rule_name,
              agent_name: ruleToDelete.agent_name
            };
            break;
          case 2:
            endpoint = `${base_Api}app_remove_agent_from_rule`,{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            };
            payload = {
              rule_name: ruleToDelete.rule_name,
              agent_name: ruleToDelete.agent_name
            };
            break;
          case 3:
            endpoint = `${base_Api}app_delete_all_rules_for_agent`,{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            };
            payload = {
              agent_name: ruleToDelete.agent_name
            };
            break;
          case 4: // Delete entire rule
            endpoint = `${base_Api}app_delete_rule`,{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            };
            payload = {
              rule_name: ruleToDelete.rule_name
            };
            break;
        }
      }

      console.log('Endpoint:', endpoint);
      console.log('Sending payload:', payload);

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete rule');
      }

      await confirmDelete();
      setShowDeleteConfirm(false);
      
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  // Update the modal UI to show descriptions for group options
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 text-red-500">
            <AlertCircle size={24} />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Delete Rule</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete "{ruleToDelete?.rule_name}"? 
              Please select an option:
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {deleteOptions.map(option => (
            <div key={option.id} className="flex flex-col space-y-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`option-${option.id}`}
                  name="deleteOption"
                  value={option.id}
                  checked={deleteOption === option.id}
                  onChange={() => setDeleteOption(option.id)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  disabled={isDeleting}
                />
                <label
                  htmlFor={`option-${option.id}`}
                  className="ml-2 text-sm text-gray-700 font-medium"
                >
                  {option.label}
                </label>
              </div>
              {option.description && (
                <div className="ml-6 text-xs text-gray-500">
                  {option.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white"
            disabled={isDeleting || !deleteOption}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteAppRuleModal.propTypes = {
  ruleToDelete: PropTypes.shape({
    rule_name: PropTypes.string.isRequired,
    agent_name: PropTypes.string,
    target: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['agent', 'group']).isRequired,
    id: PropTypes.string.isRequired
  }).isRequired,
  setShowDeleteConfirm: PropTypes.func.isRequired,
  confirmDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool
};

export default DeleteAppRuleModal;