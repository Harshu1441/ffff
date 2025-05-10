import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const DeleteAppRuleModal = ({
  ruleToDelete,
  setShowDeleteConfirm,
  confirmDelete,
  isDeleting,
}) => {
  const [deleteOption, setDeleteOption] = useState(null);

  const agentDeleteOptions = [
    { id: 1, label: 'Remove rule for this agent' },
    { id: 2, label: 'Remove agent from rule' },
    { id: 3, label: 'Remove all rules for this agent' },
  ];

  const groupDeleteOptions = [
    {
      id: 1,
      label: 'Delete entire rule',
      description: 'Completely removes this rule from the system',
    },
    {
      id: 2,
      label: 'Remove group from rule',
      description: 'Keeps the rule but removes this group from it',
    },
    {
      id: 3,
      label: 'Delete all rules for this group',
      description: 'Removes all rules associated with this group',
    },
  ];

  const deleteOptions = ruleToDelete?.type === 'group' ? groupDeleteOptions : agentDeleteOptions;

  const handleDelete = () => {
    if (!deleteOption) return;
    confirmDelete(deleteOption);
    setShowDeleteConfirm(false);
  };

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
              Are you sure you want to delete "{ruleToDelete?.rule_name}"? Please select an option:
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {deleteOptions.map((option) => (
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
                <div className="ml-6 text-xs text-gray-500">{option.description}</div>
              )}
            </div>
          ))}
        </div>

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
    id: PropTypes.string.isRequired,
  }).isRequired,
  setShowDeleteConfirm: PropTypes.func.isRequired,
  confirmDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

export default DeleteAppRuleModal;